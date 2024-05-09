import { Router } from 'express';
import { Validators } from './validation';
import { checkExact, matchedData, validationResult } from 'express-validator';
import { sendValidationError } from './errors';
import { InputCurrency } from '../model/currency';
import { SharedController } from '../controller';

export function getRoutes(controller: SharedController) {
  const router = Router()

  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Komunitin accounting API.' });
  })

  // Create currency
  router.post('/currencies', checkExact(Validators.isCurrency('data')), async (req, res) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      sendValidationError(res, validationErrors)
      return
    }
    const data = matchedData(req) as InputCurrency
    const currency = await controller.createCurrency(data)
    // Serialize currency to JSON:API
    


    res.status(200).json()
  })

  return router

}