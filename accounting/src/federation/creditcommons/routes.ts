import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsTrunkwardNode } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler } from 'src/server/handlers';
import { asyncHandler } from 'src/server/handlers';
import { Validators } from '../../server/validation';
import { CreditCommonsTrunkwardNodeSerializer } from '../../server/serialize';

/**
 * Implements the routes for the credit commons federation protocol
 * https://gitlab.com/credit-commons/cc-php-lib/-/blob/master/docs/credit-commons-openapi3.yml
 * 
 * @param controller 
 */
export function getRoutes(controller: SharedController) {
  const router = Router()

  /**
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/graft', userAuth(Scope.Accounting), checkExact(Validators.isCreditCommonsGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsTrunkwardNode) => {
      return await currencyController.creditCommons.createCreditCommonsTrunkwardNode(ctx, data.ccNodeName, data.lastHash)
    }, CreditCommonsTrunkwardNodeSerializer, 201)

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
  )

  /**
   * Propose transaction.
   */
  router.post('/transaction', lastHashAuth(), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController('TEST')
    const record = await currencyController.getDb().creditCommonsTrunkwardNode.findFirst()
    // {
    //   where: {
    //     ccNodeName: req.header('cc-node'),
    //     lastHash: req.header('last-hash')
    //   },
    //   include: {
    //     lastHash: true
    //   }
    // })
    console.log('record from db', record)
    if (!record) {
      throw new Error('Credit Commons Auth failed')
    }
    res.status(200).json({ message: 'Welcome to the Credit Commons federation protocol.' })
  }))

  return router
}