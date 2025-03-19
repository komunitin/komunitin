import { Router } from "express";
import { SharedController } from "src/controller";
import { noAuth } from "src/server/auth";
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
  router.post('/transaction', noAuth(), asyncHandler(async (req, res) => {
    // TODO
    res.status(200).json({ message: 'Welcome to the Credit Commons federation protocol.' })
  }))

  return router
}