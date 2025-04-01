import { Router } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsNode, CreditCommonsTransaction } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler, currencyResourceHandler, asyncHandler, CurrencyInputHandler, currencyHandlerHelper } from 'src/server/handlers';
import { context } from 'src/utils/context';
import { CreditCommonsValidators } from './validation';
import { Dictionary } from "ts-japi"
import { input, Resource } from "../server/parse"
import { badRequest } from "src/utils/error"


import {
  CreditCommonsNodeSerializer,
  CreditCommonsMessageSerializer,
  CreditCommonsTransactionSerializer,
} from './serialize';


function ccInputHandler<T extends Dictionary<any>, D extends Resource>(controller: SharedController, fn: CurrencyInputHandler<T,D>, status = 200) {
  return currencyHandlerHelper(controller, async (currencyController, ctx, req) => {
    const data = input<D>(req)
    if (Array.isArray(data)) {
      throw badRequest("Expected a single resource")
    }
    const resource = await fn(currencyController, ctx, data)
    return resource
  }, status)
}

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
   * Retrieve account history. Requires last-hash auth.
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
   * Retrieve account status. Requires last-hash auth.
   */
  router.get('/:code/cc/account', lastHashAuth(), asyncHandler(async (req, res) => {
    const ctx = context(req)
    const response = {
      data: {
        trades:4,
        entries:5,
        gross_in:4320,
        gross_out:1562,
        partners:1,
        pending:0,
        balance:45.983
      }
    }
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
    res.status(200).json(response)
  }))

  /**
   * Update transaction status. Requires last-hash auth.
   */
  router.patch('/:code/cc/transaction/:transId/P', lastHashAuth(), asyncHandler(async (req, res) => {
    const ctx = context(req)
    const response = 'Created'
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
    res.status(201).json(response)
  }))

  /**
   * Update transaction status. Requires last-hash auth.
   */
  router.patch('/:code/cc/transaction/relaty', lastHashAuth(), asyncHandler(async (req, res) => {
    const ctx = context(req)
    const response = 'Created'
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
    res.status(201).json(response)
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
  // router.post('/:code/cc/transaction/relay', lastHashAuth(), checkExact(CreditCommonsValidators.isTransaction()),
  //   asyncHandler(async (req, res) => {
  //     const ctx = context(req)
  //     await currencyController.creditCommons.createTransaction(ctx, data)
  //     const response = {
  //       data: [
  //         {
  //           payee: 'trunk\/branch2\/admin',
  //           payer: 'trunk\/branch\/twig\/alice',
  //           quant: 60,
  //           description: 'Payer fee of 1 to branch2\/admin',
  //           metadata: {}
  //         }
  //       ],
  //       meta: {
  //         secs_valid_left: 0
  //       }
  //     }
  //     res.setHeader('Content-Type', 'application/json')
  //     res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
  //     res.status(200).json(response)
  //   })
  // )
  router.post('/:code/cc/transaction/relay', lastHashAuth(), checkExact(CreditCommonsValidators.isTransaction()),
    ccInputHandler(controller, async (currencyController, ctx, data: CreditCommonsTransaction) => {
      return await currencyController.creditCommons.createTransaction(ctx, data)
    }, 201)
  )

  return router
}
