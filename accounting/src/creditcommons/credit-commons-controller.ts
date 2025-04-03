import { AbstractCurrencyController } from "../controller/abstract-currency-controller"
import { Context } from "../utils/context"
import { CreditCommonsNode, CreditCommonsTransaction, CreditCommonsEntry } from "../model/creditCommons"
import { LedgerCurrencyController } from '../controller/currency-controller'
import { unauthorized } from "src/utils/error"
import { TransferController } from "../controller/transfer-controller"
import { InputTransfer } from "src/model/transfer"
import { systemContext } from "src/utils/context"
import { AccountRecord } from "src/model/account"


export interface CreditCommonsController {
  getWelcome(ctx: Context): Promise<{ message: string }>
  getAccountHistory(ctx: Context): Promise<{ data: object, meta: object }>
  createNode(ctx: Context, ccNodeName: string, lastHash: string, vostroId: string): Promise<CreditCommonsNode>
  createTransaction(ctx: Context, transaction: CreditCommonsTransaction): Promise<{
    data: CreditCommonsEntry[],
    meta: {
      secs_valid_left: number,
    }
  }>
}
export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  gatewayAccountId: string = '0';
  ledgerBase: string = 'trunk/branch2/'
  
  async createNode(ctx: Context, ccNodeName: string, lastHash: string, vostroId: string): Promise<CreditCommonsNode> {
    // Only admins are allowed to set the trunkward node:
    await this.users().checkAdmin(ctx)
    await this.db().creditCommonsNode.create({
      data: {
        tenantId: this.db().tenantId,
        ccNodeName,
        lastHash,
        vostroId,
      }
    });

    return {
      ccNodeName,
      lastHash
    } as CreditCommonsNode;
  }
  async checkLastHashAuth(ctx: Context): Promise<string> {
    if (ctx.type !== 'last-hash') {
      throw new Error('no last-hash auth found in context')
    }
    const record = await this.db().creditCommonsNode.findFirst({})
    if (!record) {
      throw unauthorized('This currency has not (yet) been grafted onto any CreditCommons tree.')
    }
    if (record.ccNodeName !== ctx.lastHashAuth?.ccNodeName) {
      throw unauthorized(`cc-node ${JSON.stringify(ctx.lastHashAuth?.ccNodeName)} is not our trunkward node.`)
    }
    if (record.lastHash !== ctx.lastHashAuth?.lastHash) {
      throw unauthorized(`value of last-hash header ${JSON.stringify(ctx.lastHashAuth?.lastHash)} does not match our records.`)
    }
    return record.vostroId
  }
  async getWelcome(ctx: Context) {
    await this.checkLastHashAuth(ctx)
    return { message: 'Welcome to the Credit Commons federation protocol.' }
  }
  async getAccountHistory(ctx: Context) {
    await this.checkLastHashAuth(ctx)
    return {
      data: {
        '2025-04-01 09:22:37': 0,
        '2025-04-01 09:22:41': 0,
        '2025-04-01 09:22:42': -60
      },
      meta: {
        min: -60,
        max: 0,
        points: 3,
        start: '2025-04-01 09:22:37',
        end: '2025-04-01 09:22:42'
      }
    };
  }
  async codeToAccountId(code: string): Promise<string | undefined> {
    const record: AccountRecord | null = await this.db().account.findUnique({
      where: { 
        code,
        status: "active",
      },
      include: {
      }
    })
    return record?.id
  }
  async createTransaction(ctx: Context, transaction: CreditCommonsTransaction) {
    this.gatewayAccountId = await this.checkLastHashAuth(ctx)
    let netGain = 0
    let recipient = null
    let metas: string[] = []
    let froms: string[] = []
    for (let i=0; i < transaction.entries.length; i++) {
      let payer, payee, thisRecipient;
      if (transaction.entries[i].payer.startsWith(this.ledgerBase)) {
        thisRecipient = transaction.entries[i].payer.slice(this.ledgerBase.length)
        netGain -= transaction.entries[i].quant
        metas.push(`-${transaction.entries[i].quant} (${transaction.entries[i].description})`)
      }
      if (transaction.entries[i].payee.startsWith(this.ledgerBase)) {
        if (thisRecipient) {
          throw new Error('Payer and Payee cannot both be local')
        }
        thisRecipient = transaction.entries[i].payee.slice(this.ledgerBase.length)
        netGain += transaction.entries[i].quant
        metas.push(`+${transaction.entries[i].quant} (${transaction.entries[i].description})`)
        froms.push(transaction.entries[i].payer)
      }
      if (!thisRecipient) {
        throw new Error('Payer and Payee cannot both be remote')
      }
      if (recipient && recipient !== thisRecipient) {
        throw new Error('All entries must be to or from the same local account')
      }
      recipient = thisRecipient
    }
    if (netGain <= 0) {
      throw new Error('Net gain must be positive')
    }
    // if recipientId is a code like NET20002
    // then payeeId is a stellar account ID like
    // 2791faf5-4566-4da0-99f6-24c41041c50a
    let payeeId
    if (recipient) {
       payeeId = await this.codeToAccountId(recipient);
    }
    console.log('found payeeId for recipient', payeeId, recipient)
    if (payeeId) {
      let localTransfer: InputTransfer = {
        id: transaction.uuid,
        state: 'committed',
        amount: this.currencyController.amountFromLedger(netGain.toString()) / 10, // CC works with a test transfer of 2800 but in Komunitin dev setup, accounts cannot have a credit limit above 1000
        meta: `From Credit Commons [${froms.join(', ')}]:` + metas.join(' '),
        payer: { id: this.gatewayAccountId, type: 'account' },
        payee: { id: payeeId, type: 'account' },
      }
      await this.transfers().createTransfer(systemContext(), localTransfer)
    }
    return {
      data: transaction.entries,
      meta: {
        secs_valid_left: 0,
      },
    }
  }
}