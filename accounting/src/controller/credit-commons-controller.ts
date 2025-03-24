import { AbstractCurrencyController } from "./abstract-currency-controller";
import { Context } from "../utils/context";
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from "../model/creditCommons";
import { CreditCommonsController } from '.';

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
  async createTransaction(ctx: Context, transaction: CreditCommonsTransaction): Promise<CreditCommonsTransaction> {
    return transaction;
  // , asyncHandler(async (req, res) => {
  //   const currencyController = await controller.getCurrencyController('TEST')
  //   const record = await currencyController.getDb().creditCommonsTrunkwardNode.findFirst()
  //   // {
  //   //   where: {
  //   //     ccNodeName: req.header('cc-node'),
  //   //     lastHash: req.header('last-hash')
  //   //   },
  //   //   include: {
  //   //     lastHash: true
  //   //   }
  //   // })
  //   console.log('record from db', record)
  //   if (!record) {
  //     throw new Error('Credit Commons Auth failed')
  //   }
  //   res.status(200).json({ message: 'Welcome to the Credit Commons federation protocol.' })
  // }))
  }
}