import { Router } from "express";
import { SharedController } from "src/controller";
import { noAuth, lastHashAuth } from "src/server/auth";
import { asyncHandler } from "src/server/handlers";

/**
 * Implement the routes for the credit commons federation protocol
 * https://gitlab.com/credit-commons/cc-php-lib/-/blob/master/docs/credit-commons-openapi3.yml
 * 
 * @param controller 
 */
export function getRoutes(controller: SharedController) {
  const router = Router()

  /**
   * Propose transaction.
   */
  router.post('/transaction', lastHashAuth(), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController('TEST')
    const record = await currencyController.getDb().creditCommonsTrunkwardNode.findFirst({
      // where: {
      //   ccNodeName: req.header('cc-node'),
      //   lastHash: req.header('last-hash')
      // }
    })
    console.log('record from db', record)
    if (!record) {
      throw new Error('Credit Commons Auth failed')
    }
    res.status(200).json({ message: 'Welcome to the Credit Commons federation protocol.' })
  }))

  return router
}