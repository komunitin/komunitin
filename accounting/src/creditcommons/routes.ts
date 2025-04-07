import { Router, Request, Response } from 'express';
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
import { getCcNodeTrace } from "../utils/context"
import { KError } from "../utils/error"

import {
  CreditCommonsNodeSerializer,
  CreditCommonsMessageSerializer,
  CreditCommonsTransactionSerializer,
} from './serialize';

// function ccInputHandler<T extends Dictionary<any>, D extends Resource>(controller: SharedController, fn: CurrencyInputHandler<T,D>, status = 200) {
//   return currencyHandlerHelper(controller, async (currencyController, ctx, req) => {
//     const data = input<D>(req)
//     if (Array.isArray(data)) {
//       throw badRequest("Expected a single resource")
//     }
//     const resource = await fn(currencyController, ctx, data)
//     return resource
//   }, status)
// }

function generateCcNodeTrace(reqTrace: string): string {
  return reqTrace + ', <branch2'
}

function setResponseTrace(req: Request, res: Response) {
    const requestTrace = getCcNodeTrace(req)
    const responseTrace = generateCcNodeTrace(requestTrace)
    res.setHeader('cc-node-trace', responseTrace)
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
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/creditCommonsNodes',
    userAuth(Scope.Accounting),
    checkExact(CreditCommonsValidators.isGraft()),
    currencyInputHandler(controller, async (currencyController, ctx, data: CreditCommonsNode) => {
      // setResponseTrace(req, res)
      console.log(data)
      return await currencyController.creditCommons.createNode(ctx, data.ccNodeName, data.lastHash, data.vostroId)
    }, CreditCommonsNodeSerializer, 201),
  )

  /**
   * Retrieve a welcome message. Requires last-hash auth.
   */
  router.get('/:code/cc/',
    lastHashAuth(),
    currencyResourceHandler(controller, async (currencyController, ctx) => {
      // seResponseTrace(req, res)
      return await currencyController.creditCommons.getWelcome(ctx);
    }, CreditCommonsMessageSerializer, {}),
  )

  /**
   * CC API endpoint to create a transaction. Requires last-hash auth.
   */
  router.post('/:code/cc/transaction/relay',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      setResponseTrace(req, res)
      const ctx = context(req)
      
      console.log('body', req.body)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.createTransaction(ctx, req.body)
      res.status(200).json(response)
    }),
  )

  /**
   * Update transaction status. Requires last-hash auth.
   */
  router.patch('/:code/cc/transaction/:transId/:newState',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      setResponseTrace(req, res)
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      try {
        // console.log('updating transaction')
        await currencyController.creditCommons.updateTransaction(ctx, req.params.transId, req.params.newState)
        res.setHeader('Content-Type', 'text/html') // sic
        res.setHeader('cc-node-trace', req.get('cc-node-trace') + ', <branch2')
        res.status(201).end()
      } catch (e) {
        const response = {
          errors: [ (e as KError).message ]
        }
        res.setHeader('Content-Type', 'application/json')
        res.status(400).json(response)
      }
    }),
  )

  /**
   * Retrieve account status. Requires last-hash auth.
   */
  router.get('/:code/cc/account',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      setResponseTrace(req, res)
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.getAccount(ctx, (req.query as { acc_path: string }).acc_path)
      res.setHeader('Content-Type', 'application/json')
      res.status(200).json(response)
    }),
  )

  /**
   * Retrieve account history. Requires last-hash auth.
   */
  router.get('/:code/cc/account/history',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      setResponseTrace(req, res)
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.getAccountHistory(ctx, (req.query as { acc_path: string }).acc_path)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
      res.status(200).json(response)
    }),
  )

  return router
}
