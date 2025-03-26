import { AbstractCurrencyController } from "../controller/abstract-currency-controller"
import { Context } from "../utils/context"
import { CreditCommonsNode, CreditCommonsTransaction } from "../model/creditCommons"
import { CreditCommonsController } from '../controller'
import { LedgerCurrencyController } from '../controller/currency-controller'
import { unauthorized } from "src/utils/error"
import { TransferController } from "../controller/transfer-controller"
import { InputTransfer } from "src/model/transfer"
import { systemContext } from "src/utils/context"

export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  transferController: TransferController;
  gatewayAccountId: string = '0';
  ledgerBase: string = 'trunk/branch2/'
  constructor(readonly currencyController: LedgerCurrencyController) {
    super(currencyController)
    this.transferController = new TransferController(currencyController)
  }

  async createNode(ctx: Context, ccNodeName: string, lastHash: string): Promise<CreditCommonsNode> {
    // Only admins are allowed to set the trunkward node:
    await this.users().checkAdmin(ctx)
    await this.db().creditCommonsNode.create({
      data: {
        tenantId: this.db().tenantId,
        ccNodeName,
        lastHash,
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
  async createTransaction(ctx: Context, transaction: CreditCommonsTransaction) {
    this.gatewayAccountId = await this.checkLastHashAuth(ctx)
    
    let localTransfers: InputTransfer[] = []
    let netGain = 0;
    let recipient = null;
    for (let i=0; i < transaction.entries.length; i++) {
      let payer, payee, thisRecipient;
      if (transaction.entries[i].payer.startsWith(this.ledgerBase)) {
        payer = transaction.entries[i].payer.slice(this.ledgerBase.length)
        payee = this.gatewayAccountId
        thisRecipient = payer
        netGain -= transaction.entries[i].quant
      }
      if (transaction.entries[i].payee.startsWith(this.ledgerBase)) {
        payee = transaction.entries[i].payee.slice(this.ledgerBase.length)
        payer = this.gatewayAccountId
        if (thisRecipient) {
          throw new Error('Payer and Payee cannot both be local')
        }
        thisRecipient = payee
        netGain += transaction.entries[i].quant
      }
      if (!thisRecipient) {
        throw new Error('Payer and Payee cannot both be remote')
      }
      if (recipient && recipient !== thisRecipient) {
        throw new Error('All entries must be to or from the same local account')
      }
      recipient = thisRecipient
      localTransfers.push({
        id: `${transaction.uuid}-${i}`,
        state: 'committed',
        amount: transaction.entries[i].quant,
        meta: 'CreditCommons transaction',
        payer: { id: payer!, type: 'account' },
        payee: { id: payee!, type: 'account' },
      })
    }
    if (netGain <= 0) {
      throw new Error('Net gain must be positive')
    }
    await this.transferController.createMultipleTransfers(systemContext(), localTransfers)
    return transaction
  }
}