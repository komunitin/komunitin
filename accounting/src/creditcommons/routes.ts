import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsNode, CreditCommonsTransaction } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler, currencyResourceHandler } from 'src/server/handlers';
import { CreditCommonsValidators } from './validation';
import {
  CreditCommonsNodeSerializer as CreditCommonsNodeSerializer,
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

  /**
   * Retrieve a welcome message. Requires last-hash auth.
   */
  router.get('/:code/cc/', lastHashAuth(), currencyResourceHandler(controller, async (currencyController, ctx) => {
    return await currencyController.creditCommons.getWelcome(ctx);
  }, CreditCommonsMessageSerializer, {}))

  /**
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/cc/graft', userAuth(Scope.Accounting), checkExact(CreditCommonsValidators.isGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsNode) => {
      return await currencyController.creditCommons.createNode(ctx, data.ccNodeName, data.lastHash)
    }, CreditCommonsNodeSerializer, 201)
  )

  return router
}