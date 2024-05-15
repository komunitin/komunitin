import { Request, Response, NextFunction, Router } from 'express';
import { Validators } from './validation';
import { checkExact, matchedData, validationResult } from 'express-validator';
import { Currency } from '../model/currency';
import { Account } from "../model/account"
import { SharedController } from '../controller';
import { Serializer } from 'ts-japi';
import { params } from './request';
import { badRequest } from 'src/utils/error';

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

/**
 * Returns a flat object from a validated json:api input resource object.
 * Sets the id from the route, sets the attributes as top-level keys and
 * sets the relationships using "relationshipId" keys.
 */
const inputData = (req: Request) => {
  // Get validated input from express-validator.
  const input = matchedData(req)
  if (req.params.id) {
    if (input.data.id && req.params.id !== input.params.id) {
      throw badRequest("Route 'id' does not match with resource 'id")
    }
    input.data.id = req.params.id
  }
  const relationships = input.data.relationships ? Object.entries(input.data.relationships).reduce((rel, [key, value]: [string, any]) => {
    rel[key + "Id"] = value.data.id
    return rel
  }, {} as Record<string, string>) : {}

  return {
    id: input.data.id,
    ...input.data.attributes,
    ...relationships
  }
}

export function getRoutes(controller: SharedController) {
  const router = Router()

  // JSON:API resource serializers
  const currencySerializer = new Serializer<Currency>("currencies", {
    version: null,
    projection: null // define which fields will be serialized
  })
  const accountSerializer = new Serializer<Account>("accounts", {
    version: null,
    projection: null,    
  })

  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Komunitin accounting API.' });
  })

  // Create currency
  router.post('/currencies', checkExact(Validators.isCreateCurrency()), asyncHandler(async (req, res) => {
    validationResult(req).throw()
    const data = inputData(req)
    const currency = await controller.createCurrency(data)
    // Serialize currency to JSON:API
    const result = await currencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // List currencies
  router.get('/currencies', asyncHandler(async (req,res) => {
    const currencies = await controller.getCurrencies()
    const result = await currencySerializer.serialize(currencies)
    res.status(200).json(result)
  }))

  // Get currency
  router.get('/:code/currency', asyncHandler(async (req,res) => {
    const currency = await controller.getCurrency(req.params.code)
    const result = await currencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // Update currency
  router.patch('/:code/currency', checkExact(Validators.isUpdateCurrency()), asyncHandler(async (req, res) => {
    validationResult(req).throw()
    const data = inputData(req)
    const currencyController = await controller.getCurrencyController(req.params.code)
    const currency = await currencyController.update(data.data.attributes)
    const result = await currencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // Create account
  router.post('/:code/accounts', asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const inputAccount = {}
    const account = await currencyController.createAccount(inputAccount)
    const result = await accountSerializer.serialize(account)
    res.status(200).json(result)
  }))

  // List accounts
  router.get('/:code/accounts', asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const accounts = await currencyController.getAccounts(params(req, {
      filter: ["id", "code"],
      sort: ["code", "balance", "creditLimit", "maximumBalance", "created", "updated"]
    }))
    const result = await accountSerializer.serialize(accounts)
    res.status(200).json(result)
  }))

  // Get account
  router.get('/:code/accounts/:id', asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const account = await currencyController.getAccount(req.params.id)
    res.status(200).json(account)
  }))

  // Update account
  router.patch('/:code/accounts/:id', checkExact(Validators.isUpdateAccount()), asyncHandler(async (req, res) => {
    validationResult(req).throw()
    const currencyController = await controller.getCurrencyController(req.params.code)
    const data = inputData(req)
    const account = await currencyController.updateAccount(data)
    res.status(200).json(account)
  }))

  // Get account settings
  // Update account settings


  // Create transfer
  router.post(':code/transfers', checkExact(Validators.isCreateTransfer()), asyncHandler(async (req, res) => {
    validationResult(req).throw()
    const currencyController = await controller.getCurrencyController(req.params.code)
    const data = inputData(req)
    const transfer = await currencyController.createTransfer(data)
    res.status(200).json(transfer)
  }))

  return router

}