import { Router, ErrorRequestHandler } from 'express'
import { checkExact } from 'express-validator'
import { CreditCommonsNode } from 'src/model'
import { SharedController } from 'src/controller'
import { Scope, userAuth, lastHashAuth } from 'src/server/auth'
import { currencyInputHandler, currencyResourceHandler, asyncHandler} from 'src/server/handlers'
import { context } from 'src/utils/context'
import { CreditCommonsValidators } from './validation'
import { logger } from '../utils/logger'
import { KError } from '../utils/error'
import { getKError } from '../server/errors'

import {
  CreditCommonsNodeSerializer,
  CreditCommonsMessageSerializer,
} from './serialize';

export const ccErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err)
  const kerror = getKError(err) // from errors.ts
  const errorObj = { errors: [ kerror.message ] }
  res.status(kerror.getStatus()).json(errorObj)
}
/**
 * Implements the routes for the credit commons federation protocol
 * https://gitlab.com/credit-commons/cc-php-lib/-/blob/master/docs/credit-commons-openapi3.yml
 * 
 * @param controller 
 */
export function getRoutes(controller: SharedController) {
  const router = Router()
  router.use(ccErrorHandler)

  /**
   * Configure the trunkward CC node. Requires admin.
   */
  router.post('/:code/cc/nodes',
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
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.createTransaction(ctx, req.body)
      res.setHeader('cc-node-trace', response.trace)
      res.status(201).json(response.body)
    }),
  )

  /**
   * Update transaction status. Requires last-hash auth.
   */
  router.patch('/:code/cc/transaction/:transId/:newState',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      try {
        await currencyController.creditCommons.updateTransaction(ctx, req.params.transId, req.params.newState)
        // TODO: return the patched transaction and set the response trace
        res.status(201).end()
      } catch (e) {
        res.setHeader('Content-Type', 'application/json')
        res.status(400).json({
          errors: [ (e as KError).message ]
        })
      }
    }),
  )

  /**
   * Retrieve account status. Requires last-hash auth.
   */
  router.get('/:code/cc/account',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.getAccount(ctx, (req.query as { acc_path: string }).acc_path)
      res.setHeader('Content-Type', 'application/vnd.api+json')
      res.setHeader('cc-node-trace', response.trace)
      res.status(200).json(response.body)
    }),
  )

  /**
   * Retrieve account history. Requires last-hash auth.
   */
  router.get('/:code/cc/account/history',
    lastHashAuth(),
    asyncHandler(async (req, res) => {
      const ctx = context(req)
      const currencyController = await controller.getCurrencyController(req.params.code)
      const response = await currencyController.creditCommons.getAccountHistory(ctx, (req.query as { acc_path: string }).acc_path)
      res.setHeader('Content-Type', 'application/vnd.api+json')
      res.setHeader('cc-node-trace', response.trace)
      res.status(200).json(response.body)
    }),
  )

  return router
}
