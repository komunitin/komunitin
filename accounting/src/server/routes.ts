import { Request, Response, NextFunction, Router } from 'express';
import { Validators } from './validation';
import { checkExact, matchedData, validationResult } from 'express-validator';
import { Currency, inputCurrencyFromApi } from '../model/currency';
import { SharedController } from '../controller';
import { Serializer } from 'ts-japi';

// Let promise rejections be handled by error handler middleware.
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req,res)
    } catch (err) {
      next(err)
    }
  }
}

export function getRoutes(controller: SharedController) {
  const router = Router()

  // JSON:API resource serializers
  const currencySerializer = new Serializer<Currency>("currencies", {version: null})

  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Komunitin accounting API.' });
  })

  // Create currency
  router.post('/currencies', checkExact(Validators.isCurrency('data')), asyncHandler(async (req, res) => {
    validationResult(req).throw()
    const data = matchedData(req)
    const inputCurrency = inputCurrencyFromApi(data)
    const currency = await controller.createCurrency(inputCurrency)
    // Serialize currency to JSON:API
    const result = await currencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  router.get('/currencies', asyncHandler(async (req,res) => {
    const currencies = await controller.getCurrencies()
    const result = await currencySerializer.serialize(currencies)
    res.status(200).json(result)
  }))

  return router

}