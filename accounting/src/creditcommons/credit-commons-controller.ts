import { AbstractCurrencyController } from "../controller/abstract-currency-controller"
import { Context } from "../utils/context"
import { CreditCommonsNode, CreditCommonsTransaction, CreditCommonsEntry } from "../model/creditCommons"
import { unauthorized } from "src/utils/error"
import { InputTransfer } from "src/model/transfer"
import { systemContext } from "src/utils/context"
import { AccountRecord } from "src/model/account"
import { Transfer } from "src/model"

function formatDateTime(d: Date) {
  const year = ('0000'+(d.getUTCFullYear())).slice(-4)
  const month = ('00'+(d.getUTCMonth()+1)).slice(-2)
  const day = ('00'+(d.getUTCDate())).slice(-2)
  const hour = ('00'+(d.getUTCHours())).slice(-2)
  const minutes = ('00'+(d.getUTCMinutes())).slice(-2)
  const seconds = ('00'+(d.getUTCSeconds())).slice(-2)
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}

export interface CreditCommonsController {
  getWelcome(ctx: Context): Promise<{ message: string }>
  createNode(ctx: Context, peerNodePath: string, ourNodePath: string, lastHash: string, vostroId: string): Promise<CreditCommonsNode>
  createTransaction(ctx: Context, transaction: CreditCommonsTransaction): Promise<{
    data: CreditCommonsEntry[],
    meta: {
      secs_valid_left: number,
    }
  }>
  updateTransaction(ctx: Context, transId: string, newState: string): Promise<void>
  getAccount(ctx: Context, accountCode: string): Promise<{
    trades: number,
    entries: number,
    gross_in: number,
    gross_out: number,
    partners: number,
    pending: number,
    balance: number
  }>
  getAccountHistory(ctx: Context, accountCode: string): Promise<{ data: object, meta: object }>
}

export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  private async accountCodeToAccountId(accountCode: string): Promise<string | undefined> {
    const account = await this.accounts().getAccountBy(systemContext(), "code", accountCode)
    return account?.id
  }

  private async getTransactions(accountCode: string): Promise<{ transfersIn: Transfer[], transfersOut: Transfer[] }> {
    const accountId = await this.accountCodeToAccountId(accountCode)
    if (!accountId) {
      return { transfersIn: [], transfersOut: [] }
    }
    const transfers = await this.transfers().getTransfers(systemContext(), {
      filters: {
        state: 'committed',
        account: accountId
      },
      include: [],
      sort: {field: "updated", order: "asc"},
      pagination: {cursor: 0, size: 100}
    } as unknown as any)
    return {
      transfersIn: (transfers).filter(t => t.payee.id === accountId),
      transfersOut: (transfers).filter(t => t.payer.id === accountId)
    }
  }
  async getAccount(ctx: Context, accountId: string) {
    await this.checkLastHashAuth(ctx)
    const { transfersIn, transfersOut } = await this.getTransactions(accountId)

    let grossIn = 0
    let grossOut = 0
    let balance = 0
    transfersIn.forEach(t => {
      grossIn += t.amount
      balance += t.amount
    })
    transfersOut.forEach(t => {
      grossOut += t.amount
      balance -= t.amount
    })
    return {
      trades: transfersIn.length, // FIXME: Can we remember this?
      entries: transfersIn.length,
      gross_in: parseFloat(this.currencyController.amountToLedger(grossIn)),
      gross_out: parseFloat(this.currencyController.amountToLedger(grossOut)),
      partners: 0, // ?
      pending: 0,
      balance: parseFloat(this.currencyController.amountToLedger(balance))
    }
  }
  async getAccountHistory(ctx: Context, accountCode: string) {
    await this.checkLastHashAuth(ctx)
    const { transfersIn, transfersOut } = await this.getTransactions(accountCode)
    const transfers = transfersIn.concat(transfersOut.map(t => { t.amount = -t.amount; return t }))
    let data: {
      [created: string]: number
    } = {}
    let min = Infinity
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
        points: 0, // ?
        start: formatDateTime(start),
        end: formatDateTime(end)
      }
    };
  }
  async createNode(ctx: Context, peerNodePath: string, ourNodePath: string, lastHash: string, vostroId: string): Promise<CreditCommonsNode> {
    // Only admins are allowed to set the trunkward node:
    await this.users().checkAdmin(ctx)
    await this.db().creditCommonsNode.create({
      data: {
        tenantId: this.db().tenantId,
        peerNodePath,
        ourNodePath,
        lastHash,
        vostroId,
      }
    });

    return {
      peerNodePath,
      lastHash
    } as CreditCommonsNode;
  }
  async checkLastHashAuth(ctx: Context): Promise<{ vostroId: string, ourNodePath: string }> {
    if (ctx.type !== 'last-hash') {
      throw new Error('no last-hash auth found in context')
    }
    const record = await this.db().creditCommonsNode.findFirst({})
    console.log('checkLastAuth', record)
    if (!record) {
      throw unauthorized('This currency has not (yet) been grafted onto any CreditCommons tree.')
    }
    if (record.peerNodePath !== ctx.lastHashAuth?.peerNodePath) {
      throw unauthorized(`cc-node ${JSON.stringify(ctx.lastHashAuth?.peerNodePath)} is not our trunkward node.`)
    }
    if (record.lastHash !== ctx.lastHashAuth?.lastHash) {
      throw unauthorized(`value of last-hash header ${JSON.stringify(ctx.lastHashAuth?.lastHash)} does not match our records.`)
    }
    return {
      vostroId: record.vostroId,
      ourNodePath: record.ourNodePath,
    }
  }
  async getWelcome(ctx: Context) {
    await this.checkLastHashAuth(ctx)
    return { message: 'Welcome to the Credit Commons federation protocol.' }
  }

  async createTransaction(ctx: Context, transaction: CreditCommonsTransaction) {
    const { vostroId, ourNodePath } = await this.checkLastHashAuth(ctx)
    const ledgerBase = `${ourNodePath}/`
    let netGain = 0
    let recipient = null
    let metas: string[] = []
    let froms: string[] = []
    for (let i=0; i < transaction.entries.length; i++) {
      let thisRecipient;
      if (transaction.entries[i].payer.startsWith(ledgerBase)) {
        thisRecipient = transaction.entries[i].payer.slice(ledgerBase.length)
        netGain -= transaction.entries[i].quant
        metas.push(`-${transaction.entries[i].quant} (${transaction.entries[i].description})`)
      }
      if (transaction.entries[i].payee.startsWith(ledgerBase)) {
        if (thisRecipient) {
          throw new Error('Payer and Payee cannot both be local')
        }
        thisRecipient = transaction.entries[i].payee.slice(ledgerBase.length)
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
       payeeId = await this.accountCodeToAccountId(recipient);
    }
    if (payeeId) {
      let localTransfer: InputTransfer = {
        id: transaction.uuid,
        state: 'committed',
        amount: this.currencyController.amountFromLedger(netGain.toString()),
        meta: `From Credit Commons [${froms.join(', ')}]:` + metas.join(' '),
        payer: { id: vostroId, type: 'account' },
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