import { Account, Currency, InputTransfer, Transfer, TransferState, User, userHasAccount } from "src/model";
import { AbstractCurrencyController } from "./abstract-currency-controller";
import { isExternalResourceIdentifier } from "./external-resource-controller";
import { Context } from "src/utils/context";
import { badRequest, badTransaction, forbidden, internalError } from "src/utils/error";
import { ExternalResource, ExternalResourceIdentifier } from "src/model/resource";
import { WithRequired } from "src/utils/types";
import { amountToLedger, convertAmount } from "./currency-controller";
import { TransferSerializer } from "src/server/serialize";
import { createExternalToken } from "./external-jwt";
import { config } from "src/config";

type ExternalPayeeTransfer = WithRequired<Transfer, "externalPayee">
type ExternalPayerTransfer = WithRequired<Transfer, "externalPayer">

export class ExternalTransferController extends AbstractCurrencyController {
  public isExternalTransfer(data: InputTransfer) {
    const isExternalPayer = isExternalResourceIdentifier(data.payer) 
    const isExternalPayee = isExternalResourceIdentifier(data.payee)

    return isExternalPayer || isExternalPayee
  }

  public async createExternalTransfer(ctx: Context, data: InputTransfer): Promise<Transfer> {
    const isExternalPayer = isExternalResourceIdentifier(data.payer) 
    const isExternalPayee = isExternalResourceIdentifier(data.payee)

    if (isExternalPayer && isExternalPayee) {
      throw badRequest("Both payer and payee cannot be external")
    }

    if (isExternalPayee) {
      return await this.createTransferExternalPayee(ctx, data)
    } else if (isExternalPayer) {
      return await this.createTransferExternalPayer(ctx, data)
    }

    throw badRequest("Either payer or payee must be external")

  }

  /**
   * Payment to external account. 
   */
  private async createTransferExternalPayee(ctx: Context, data: InputTransfer): Promise<Transfer> {
    const user = await this.users().checkUser(ctx)

    // Check that the user is either the admin or the payer.
    const payer = await this.accounts().getAccount(ctx, data.payer.id)
    if (!this.users().isAdmin(user) 
      && !userHasAccount(user, payer)) {
      throw forbidden("User is not allowed to transfer from this account")
    }

    // Create local transfer record with "new" state.
    const transfer = await this.transfers().createTransferRecord(data, payer, this.currency().externalAccount, user)

    // Create external transfer record
    transfer.externalPayee = await this.getExternalAccount(ctx, data.payee as ExternalResourceIdentifier)

    const externalTransferRecord = await this.db().externalTransfer.create({ 
      data: {
        id: transfer.id,
        externalPayeeId: transfer.externalPayee.id
      }
    })

    await this.updateTransferStateExternalPayee(ctx, transfer as ExternalPayeeTransfer, data.state, user)

    return transfer
  }

  private async getExternalAccount(ctx: Context, resourceId: ExternalResourceIdentifier) {
    // Fetch and save external account.
    return await this.externalResources().getExternalResource<Account>(ctx, resourceId)
  }

  private async getExternalAccountCurrency(ctx: Context, externalAccount: ExternalResource<Account>) {
    // Build the currency URL from the account URL.
    const currencyHref = externalAccount.href.substring(0, externalAccount.href.lastIndexOf("/accounts/")) + "/currency"
    const currencyResourceId = {
      id: externalAccount.resource.currency.id,
      type: "currencies",
      meta: {
        href: currencyHref,
        external: true as const
      }
    }
    // Fetch and save external currency for later use.
    return await this.externalResources().getExternalResource<Currency>(ctx, currencyResourceId)
  }

  private async updateTransferStateExternalPayee(ctx: Context, transfer: ExternalPayeeTransfer, state: TransferState, user: User) {
    if (transfer.state == state) {
      return
    }
    this.transfers().checkTransferTransition(transfer, state)
    
    // Only "new" => "committed" left (before implementing patch/delete).
    if (state === "committed") {
      this.transfers().saveTransferState(transfer, "submitted")
      try {
        const transaction = await this.submitTransferExternalPayee(ctx, transfer, user)
        transfer.hash = transaction.hash
        await this.transfers().saveTransferState(transfer, "committed")
        // Notify the external server about the transfer.
        await this.notifyTransferExternalPayee(ctx, transfer)

      } catch (e) {
        this.transfers().saveTransferState(transfer, "failed")
        throw e
      }
    }
  }

  private async submitTransferExternalPayee(ctx: Context, transfer: ExternalPayeeTransfer, user: User) {
    const externalCurrency = await this.getExternalAccountCurrency(ctx, transfer.externalPayee)

    // Convert the amount to the payee (remote) currency.
    const payeeAmount = convertAmount(transfer.amount, this.currency(), externalCurrency.resource)
    const payeeAmountLedger = amountToLedger(externalCurrency.resource, payeeAmount)
    
    const path = await this.currencyController.ledger.quotePath({
      destCode: externalCurrency.resource.code,
      destIssuer: externalCurrency.resource.keys.issuer,
      amount: payeeAmountLedger,
    })

    // There is no trust path between these two accounts. The transfer is not possible.
    if (!path) {
      throw badTransaction(`No trust path between currencies ${this.currency().code} and ${externalCurrency.resource.code}`)
    }
    // There is a trust path! Submit the transaction.

    const ledgerPayer = await this.currencyController.ledger.getAccount(transfer.payer.key)
    const transaction = await ledgerPayer.externalPay({
        payeePublicKey: transfer.externalPayee.resource.key,
        amount: payeeAmountLedger,
        path
      }, {
        account: await (this.users().isAdmin(user) ? this.keys().adminKey() : this.keys().retrieveKey(transfer.payer.key)),
        sponsor: await this.keys().sponsorKey()
      })
    
    // Update payer and external account balances in DB.
    await Promise.all([
      this.accounts().updateAccountBalance(transfer.payer),
      this.accounts().updateAccountBalance(transfer.payee)
    ])

    return transaction
  }

  private async notifyTransferExternalPayee(ctx: Context, transfer: ExternalPayeeTransfer) {
    // Build the external transfers endpoint from the account endpoint.
    const endpoint = transfer.externalPayee.href.substring(0, transfer.externalPayee.href.lastIndexOf("/accounts/")) + "/transfers"
    // Build the transfer JSON:API object for the external service.
    const externalPayerTransfer: ExternalPayerTransfer = {
      ...transfer,
      externalPayee: undefined,
      payee: transfer.externalPayee.resource,
      externalPayer: {
        id: transfer.payer.id,
        href: `${config.API_BASE_URL}/${this.currency().code}/accounts/${transfer.payer.id}`,
        type: "accounts",
        resource: transfer.payer
      },
    }
    const data = await TransferSerializer.serialize(externalPayerTransfer)
    // Build the external auth token
    const key = await this.keys().retrieveKey(transfer.payer.key)
    const token = await createExternalToken(key)
    // Perform the HTTP request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    })
    // Check the response
    if (!response.ok) {
      throw internalError(`Failed to notify external payee: ${response.statusText}`, response.json())
    }
    return response.json()
  }

  private async createTransferExternalPayer(ctx: Context, data: InputTransfer): Promise<Transfer> {
    // The payer is external and the payee is local, so it is the remote server that 
    // needs to submit the transfer to the ledger.There are 2 cases:

    // - The submitter is a user from our local currency trying to create a payment request from an
    // external account. This is not supported by now.
    // - The submitter is an external service and the transaction has already been submitted to the 
    // ledger. This is supported.
    if (ctx.type === "external") {
      if (data.hash) {
        if (data.state !== "committed") {
          throw badRequest(`The transfer state must be "committed" for a transfer with a hash`)
        }
        // Retrieve the transfer data from the ledger.
        const ledgerTransfer = await this.currencyController.ledger.getTransfer(data.hash)
        if (ledgerTransfer.payer !== ctx.accountKey) {
          throw forbidden(`The logged in external payer ${ctx.accountKey} is not the payer of the transfer ${data.hash}`)
        }
        // Check that the given local payee exists and matches the transfer key.
        const payee = await this.accounts().getAccount(ctx, data.payee.id)
        if (ledgerTransfer.payee !== payee.key) {
          throw badRequest(`The given payee ${data.payee.id} does not match the transfer key ${ledgerTransfer.payee}`)
        }
        // Check the external payer
        const externalPayer = await this.externalResources().getExternalResource<Account>(ctx, data.payer as ExternalResourceIdentifier)
        if (ledgerTransfer.payer !== externalPayer.resource.key) {
          throw badRequest(`The given payer ${data.payer.id} does not match the transfer key ${ledgerTransfer.payer}`)
        }
        // Compute the amount from the ledger data.
        data.amount = this.currencyController.amountFromLedger(ledgerTransfer.amount)

        // All checks ok, so create the transfer record (in "new" state).
        const transfer = await this.transfers().createTransferRecord(data, this.currency().externalAccount, payee, this.currency().admin as User)
        transfer.externalPayer = externalPayer
        // and the external transfer record.
        await this.db().externalTransfer.create({
          data: {
            id: transfer.id,
            externalPayerId: externalPayer.id,
          }
        })

        // Update account balances
        await Promise.all([
          this.accounts().updateAccountBalance(transfer.payer),
          this.accounts().updateAccountBalance(transfer.payee)
        ])

        // Set the transfer to committed state.
        await this.transfers().saveTransferState(transfer, "committed")

        return transfer
      } else {
        throw forbidden(`External users can't initiate transfers.`)
      }
    } else {
      // TODO: Payment requests with external payers are dangerous because a user could 
      // spam payment requests to external unknown users. That could nonetheless be provided 
      // by only allowing payment requests from whitelisted external accounts or currencies.
      throw forbidden(`External payment requests are not supported.`) 
    }
  }
}