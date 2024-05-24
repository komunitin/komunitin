import { Request, Response, NextFunction, Router } from 'express';
import { Validators } from './validation';
import { checkExact } from 'express-validator';
import { SharedController } from '../controller';
import { collectionParams, resourceParams } from './request';
import { Scope, auth, noAuth } from './auth';
import { context } from 'src/utils/context';
import { input } from './parse';
import { AccountSerializer, CurrencySerializer, TransferSerializer } from './serialize';


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

  router.get('/', noAuth(), (req, res) => {
    res.json({ message: 'Welcome to the Komunitin accounting API.' });
  })

  // Create currency
  router.post('/currencies', auth(Scope.Accounting), checkExact(Validators.isCreateCurrency()), asyncHandler(async (req, res) => {
    const data = input(req)
    const currency = await controller.createCurrency(context(req), data)
    // Serialize currency to JSON:API
    const result = await CurrencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // List currencies
  router.get('/currencies', noAuth(), asyncHandler(async (req,res) => {
    const currencies = await controller.getCurrencies(context(req))
    const result = await CurrencySerializer.serialize(currencies)
    res.status(200).json(result)
  }))

  // Get currency
  router.get('/:code/currency', noAuth(), asyncHandler(async (req,res) => {
    const currency = await controller.getCurrency(context(req), req.params.code)
    const result = await CurrencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // Update currency
  router.patch('/:code/currency', auth(Scope.Accounting), checkExact(Validators.isUpdateCurrency()), asyncHandler(async (req, res) => {
    const data = input(req)
    const currencyController = await controller.getCurrencyController(req.params.code)
    const currency = await currencyController.update(context(req), data)
    const result = await CurrencySerializer.serialize(currency)
    res.status(200).json(result)
  }))

  // Create account
  router.post('/:code/accounts', auth(Scope.Accounting), checkExact(Validators.isCreateAccount()), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const inputAccount = input(req)
    const account = await currencyController.createAccount(context(req), inputAccount)
    const result = await AccountSerializer.serialize(account)
    res.status(200).json(result)
  }))

  // List accounts
  router.get('/:code/accounts', auth(Scope.Accounting), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const options = collectionParams(req, {
      filter: ["id", "code"],
      sort: ["code", "balance", "creditLimit", "maximumBalance", "created", "updated"],
      include: ["currency"]
    })
    const accounts = await currencyController.getAccounts(context(req), options)
    const result = await AccountSerializer.serialize(accounts, {
      include: options.include
    })
    res.status(200).json(result)
  }))

  // Get account
  router.get('/:code/accounts/:id', auth(Scope.Accounting), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    const account = await currencyController.getAccount(context(req), req.params.id)
    const options = resourceParams(req, {
      include: ["currency"]
    })
    const result = await AccountSerializer.serialize(account, {
      include: options.include
    })
    res.status(200).json(result)
  }))

  // Update account
  router.patch('/:code/accounts/:id', auth(Scope.Accounting), checkExact(Validators.isUpdateAccount()), asyncHandler(async (req, res) => {
    const data = input(req)
    const currencyController = await controller.getCurrencyController(req.params.code)
    const account = await currencyController.updateAccount(context(req), data)
    const result = await AccountSerializer.serialize(account)
    res.status(200).json(result)
  }))

  // Get account settings
  // Update account settings

  // Delete account.
  router.delete('/:code/accounts/:id', auth(Scope.Accounting), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    await currencyController.deleteAccount(context(req), req.params.id)
    res.status(204).end()
  }))

  // Create transfer
  router.post(':code/transfers', auth(Scope.Accounting), checkExact(Validators.isCreateTransfer()), asyncHandler(async (req, res) => {
    const data = input(req)
    const currencyController = await controller.getCurrencyController(req.params.code)
    const transfer = await currencyController.createTransfer(context(req), data)
    const result = await TransferSerializer.serialize(transfer)
    res.status(200).json(result)
  }))

  return router

}