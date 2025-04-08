import { AbstractCurrencyController } from "../controller/abstract-currency-controller"
import { Context } from "../utils/context"
import { CreditCommonsNode, CreditCommonsTransaction, CreditCommonsEntry } from "../model/creditCommons"
import { unauthorized } from "src/utils/error"
import { InputTransfer } from "src/model/transfer"
import { systemContext } from "src/utils/context"
import { AccountRecord } from "src/model/account"
import { Transfer } from "src/model"

function formatDateTime(d: Date) {
  const year = d.getFullYear()
  const month = ('00'+(d.getMonth()+1)).slice(-2)
  const day = ('00'+(d.getDay())).slice(-2)
  const hour = ('00'+(d.getHours())).slice(-2)
  const minutes = ('00'+(d.getMinutes())).slice(-2)
  const seconds = ('00'+(d.getSeconds())).slice(-2)
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}

export interface CreditCommonsController {
  getWelcome(ctx: Context): Promise<{ message: string }>
  createNode(ctx: Context, ccNodeName: string, lastHash: string, vostroId: string): Promise<CreditCommonsNode>
  createTransaction(ctx: Context, transaction: CreditCommonsTransaction): Promise<{
    data: CreditCommonsEntry[],
    meta: {
      secs_valid_left: number,
    }
  }>
  updateTransaction(ctx: Context, transId: string, newState: string): Promise<void>
  getAccount(ctx: Context, accountId: string): Promise<{
    trades: number,
    entries: number,
    gross_in: number,
    gross_out: number,
    partners: number,
    pending: number,
    balance: number
  }>
  getAccountHistory(ctx: Context, accountId: string): Promise<{ data: object, meta: object }>
}

export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  gatewayAccountId: string = '0';
  ledgerBase: string = 'trunk/branch2/'
  private async getTransactions(accountId: string): Promise<{ transfersIn: Transfer[], transfersOut: Transfer[] }> {
    return {
      transfersIn: (await this.transfers().getTransfers(systemContext(), {
        filters: {
          state: 'committed',
          // payee: { users: { some: { code: accountId } } }
        },
        include: [],
        sort: {field: "updated", order: "asc"},
        pagination: {cursor: 0, size: 100}
      } as unknown as any)).filter(t => t.payee.code === accountId),
      transfersOut: (await this.transfers().getTransfers(systemContext(), {
        filters: {
          // payer.code === accountId
        },
        include: [],
        sort: {field: "updated", order: "asc"},
        pagination: {cursor: 0, size: 100}
      })).filter(t => t.payee.code === accountId)
  
    }
  }
  async getAccount(ctx: Context, accountId: string) {
    const { transfersIn, transfersOut } = await this.getTransactions(accountId)

    let grossIn = 0
    let grossOut = 0
    let balance = 0
    transfersIn.map(t => {
      grossIn += t.amount
      balance += t.amount
    })
    transfersOut.map(t => {
      grossOut += t.amount
      balance -= t.amount
    })
    return {
      trades: transfersIn.length, // FIXME: Can we remember this?
      entries: transfersIn.length,
      gross_in: parseFloat(this.currencyController.amountToLedger(grossIn)),
      gross_out: parseFloat(this.currencyController.amountToLedger(grossOut)),
      partners: 1, // ?
      pending: 0,
      balance: parseFloat(this.currencyController.amountToLedger(balance))
    }
  }
  
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
  async getAccountHistory(ctx: Context, accountId: string) {
    await this.checkLastHashAuth(ctx)
    const { transfersIn, transfersOut } = await this.getTransactions(accountId)
    const transfers = transfersIn.concat(transfersOut.map(t => { t.amount = -t.amount; return t }))
    let data: {
      [created: string]: number
    } = {}
    let min = 0
    let max = 0
    let start = new Date('9999')
    let end = new Date('0000')

    transfers.forEach((t: Transfer) => {
      const amount = parseFloat(this.currencyController.amountToLedger(t.amount))
      data[formatDateTime(t.created)] = amount
      if (amount < min) { min = amount }
      if (amount > max) { max = amount }
      if (t.created < start) { start = t.created }
      if (t.created > end) { end = t.created }
    })
    return {
      data,
      meta: {
        min,
        max,
        points: 3,
        start: formatDateTime(start),
        end: formatDateTime(end)
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
    if (payeeId) {
      let localTransfer: InputTransfer = {
        id: transaction.uuid,
        state: 'committed',
        amount: this.currencyController.amountFromLedger(netGain.toString()),
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
  async updateTransaction(ctx: Context, transId: string, newState: string) {
    throw new Error('not implemented yet')
  }
}