import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler, currencyResourceHandler } from 'src/server/handlers';
import { CreditCommonsValidators } from './validation';
import {
  CreditCommonsTrunkwardNodeSerializer,
  CreditCommonsTransactionSerializer,
  CreditCommonsMessageSerializer
} from './serialize';

/**
 * Implements the routes for the credit commons federation protocol
 * https://gitlab.com/credit-commons/cc-php-lib/-/blob/master/docs/credit-commons-openapi3.yml
 * 
 * @param controller 
 */
export function getRoutes(controller: SharedController) {
  const router = Router()

  router.get('/:code/', lastHashAuth(), currencyResourceHandler(controller, async (currencyController, ctx) => {
    return await currencyController.creditCommons.getWelcome(ctx);
  }, CreditCommonsMessageSerializer, {}))

  /**
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/graft', userAuth(Scope.Accounting), checkExact(CreditCommonsValidators.isGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsTrunkwardNode) => {
      return await currencyController.creditCommons.createTrunkwardNode(ctx, data.ccNodeName, data.lastHash)
    }, CreditCommonsTrunkwardNodeSerializer, 201)
  )

  // /**
  //  * Propose transaction.
  //  */
  // router.post('/:code/transaction', lastHashAuth(), //checkExact(CreditCommonsValidators.isTransaction()),
  //   currencyInputHandler(controller, async (currencyController, ctx, transaction: CreditCommonsTransaction) => {
  //     console.log('creating transaction', transaction);
  //     return await currencyController.creditCommons.createTransaction(ctx, transaction)
  //   }, CreditCommonsTransactionSerializer, 201)
  // )

  return router
}