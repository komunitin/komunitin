import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler } from 'src/server/handlers';
import { asyncHandler } from 'src/server/handlers';
import { Validators } from '../../server/validation';
import { CreditCommonsTrunkwardNodeSerializer, CreditCommonsTransactionSerializer } from './serialize';

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
      return await currencyController.creditCommons.createTrunkwardNode(ctx, data.ccNodeName, data.lastHash)
    }, CreditCommonsTrunkwardNodeSerializer, 201)
  )

  /**
   * Propose transaction.
   */
  router.post('/:code/transaction', lastHashAuth(), checkExact(Validators.isCreditCommonsGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, transaction: CreditCommonsTransaction) => {
      return await currencyController.creditCommons.createTransaction(ctx, transaction)
    }, CreditCommonsTransactionSerializer, 201)
  )

  return router
}