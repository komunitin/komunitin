import { AbstractCurrencyController } from "./abstract-currency-controller";
import { Context } from "../utils/context";
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from "../model/creditCommons";
import { CreditCommonsController } from '.';

// FIXME: extension of TransferController is a stopgap
export class CreditCommonsControllerImpl extends AbstractCurrencyController implements CreditCommonsController {
  async createTrunkwardNode(ctx: Context, ccNodeName: string, lastHash: string): Promise<CreditCommonsTrunkwardNode> {

  // router.post('/graft', lastHashAuth(), asyncHandler(async (req, res) => {
  //       // // Admins are allowed to do anything.
  //       // if (this.users().isAdmin(user)) {
  //       //   allowed = true
  //       // }
  //   const currencyController = await controller.getCurrencyController('TEST')
  //   await currencyController.getDb().creditCommonsTrunkwardNode.create({
  //       data: {
  //         ccNodeName,
  //         code,
  //         // Initialize ledger values with what we have just created.
  //         creditLimit,
  //         maximumBalance,
  //         balance: 0,
  
  //         // Initialize some account settings{

  //   })
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