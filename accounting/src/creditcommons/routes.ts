import { Router, Request, Response } from 'express';
import { checkExact } from 'express-validator';
import { CreditCommonsNode } from 'src/model';
import { SharedController } from 'src/controller';
import { Scope, userAuth, lastHashAuth } from 'src/server/auth';
import { currencyInputHandler, currencyResourceHandler, asyncHandler} from 'src/server/handlers';
import { context } from 'src/utils/context';
import { CreditCommonsValidators } from './validation';
import { getCcNodeTrace } from "../utils/context"
import { KError } from "../utils/error"

import {
  CreditCommonsNodeSerializer,
  CreditCommonsMessageSerializer,
} from './serialize';

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
      return await currencyController.creditCommons.createNode(ctx, data.peerNodePath, data.ourNodePath, data.lastHash, data.vostroId)
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
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.createTransaction(ctx, req.body)
      res.status(201).json(response)
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
      res.setHeader('Content-Type', 'application/vnd.api+json')
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
      res.setHeader('Content-Type', 'application/vnd.api+json')
      res.setHeader('cc-node-trace', 'twig>, branch>, trunk>, branch2>, <branch2')
      res.status(200).json(response)
    }),
  )

  return router
}
