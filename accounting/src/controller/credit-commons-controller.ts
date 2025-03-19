import { AbstractCurrencyController } from "./abstract-currency-controller"
import { Context } from "../utils/context"
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from "../model/creditCommons"
import { CreditCommonsController } from '.'
import { unauthorized } from "src/utils/error"

export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  async createTrunkwardNode(ctx: Context, ccNodeName: string, lastHash: string): Promise<CreditCommonsTrunkwardNode> {
    // Only admins are allowed to set the trunkward node:
    await this.users().checkAdmin(ctx)
    await this.db().creditCommonsTrunkwardNode.create({
      data: {
        tenantId: this.db().tenantId,
        ccNodeName,
        lastHash,
      }
    });
  
    return {
      ccNodeName,
      lastHash
    } as CreditCommonsTrunkwardNode;
  }
  async checkLastHashAuth(ctx: Context) {
    if (ctx.type !== 'last-hash') {
      throw new Error('no last-hash auth found in context')
    }
    const record = await this.db().creditCommonsTrunkwardNode.findFirst({})
    if (!record) {
      throw unauthorized('This Komunitin has not (yet) been grafted onto any CreditCommons tree.')
    }
    if (record.ccNodeName !== ctx.lastHashAuth?.ccNodeName) {
      throw unauthorized(`cc-node ${JSON.stringify(ctx.lastHashAuth?.ccNodeName)} is not our trunkward node.`)
    }
    if (record.lastHash !== ctx.lastHashAuth?.lastHash) {
      throw unauthorized(`value of last-hash header ${JSON.stringify(ctx.lastHashAuth?.lastHash)} does not match our records.`)
    }
  }
  async getWelcome(ctx: Context) {
    await this.checkLastHashAuth(ctx)
    return { message: 'Welcome to the Credit Commons federation protocol.' }
  }
}