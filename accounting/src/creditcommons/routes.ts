import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsNode, CreditCommonsTransaction } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler, currencyResourceHandler, asyncHandler } from 'src/server/handlers';
import { context } from 'src/utils/context';
import { CreditCommonsValidators } from './validation';
import {
  CreditCommonsNodeSerializer,
  CreditCommonsMessageSerializer,
  CreditCommonsTransactionSerializer,
} from './serialize';

/**
 * Implements the routes for the credit commons federation protocol
 * https://gitlab.com/credit-commons/cc-php-lib/-/blob/master/docs/credit-commons-openapi3.yml
 * 
 * @param controller 
 */
export function getRoutes(controller: SharedController) {
  const router = Router()

  /**
   * Retrieve a welcome message. Requires last-hash auth.
   */
  router.get('/:code/cc/', lastHashAuth(), currencyResourceHandler(controller, async (currencyController, ctx) => {
    return await currencyController.creditCommons.getWelcome(ctx);
  }, CreditCommonsMessageSerializer, {}))

  /**
   * Retrieve a welcome message. Requires last-hash auth.
   */
  router.get('/:code/cc/account/history', lastHashAuth(), asyncHandler(async (req, res) => {
    const ctx = context(req)
    const currencyController = await controller.getCurrencyController(req.params.code)
    const response = await currencyController.creditCommons.getAccountHistory(ctx)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
    res.status(200).json(response)
  }))

  /**
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/creditCommonsNodes', userAuth(Scope.Accounting), checkExact(CreditCommonsValidators.isGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsNode) => {
      console.log(data)
      return await currencyController.creditCommons.createNode(ctx, data.ccNodeName, data.lastHash, data.vostroId)
    }, CreditCommonsNodeSerializer, 201)
  )

  /**
   * CC API endpoint to create a transaction. Requires last-hash auth.
   * FIXME: should not be using serializer.
   */
  router.post('/:code/cc/transaction', lastHashAuth(), checkExact(CreditCommonsValidators.isTransaction()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsTransaction) => {
      return await currencyController.creditCommons.createTransaction(ctx, data)
    }, CreditCommonsTransactionSerializer, 201)
  )

  return router
}
