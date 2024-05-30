import { Request, Response, NextFunction, Router } from 'express';
import { Validators } from './validation';
import { checkExact, param } from 'express-validator';
import { CurrencyController, SharedController } from '../controller';
import { CollectionOptions, CollectionParamsOptions, ResourceOptions, ResourceParamsOptions, collectionParams, resourceParams } from './request';
import { Scope, auth, noAuth } from './auth';
import { Context, context } from 'src/utils/context';
import { input } from './parse';
import { AccountSerializer, AccountSettingsSerializer, CurrencySerializer, TransferSerializer } from './serialize';
import { Dictionary, Serializer } from 'ts-japi';
import { AccountSettings, InputAccount, InputTransfer, UpdateAccount, UpdateCurrency, UpdateTransfer } from 'src/model';
import { asyncHandler, currencyCollectionHandler, currencyInputHandler, currencyResourceHandler } from './handlers';

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
  router.patch('/:code/currency', auth(Scope.Accounting), checkExact(Validators.isUpdateCurrency()), 
    currencyInputHandler(controller, async (currencyController, ctx, data: UpdateCurrency) => {
      return await currencyController.update(ctx, data)
    }, CurrencySerializer)
  )

  // Create account
  router.post('/:code/accounts', auth(Scope.Accounting), checkExact(Validators.isCreateAccount()), 
    currencyInputHandler(controller, async (currencyController, ctx, data: InputAccount) => {
      return await currencyController.createAccount(ctx, data)
    }, AccountSerializer)
  )

  // List accounts
  router.get('/:code/accounts', auth(Scope.Accounting), 
    currencyCollectionHandler(controller, async (currencyController, ctx, params) => {
      return await currencyController.getAccounts(ctx, params)
    }, AccountSerializer, {
      filter: ["id", "code"],
      sort: ["code", "balance", "creditLimit", "maximumBalance", "created", "updated"],
      include: ["currency"]
    })
  )

  // Get account
  router.get('/:code/accounts/:id', auth(Scope.Accounting), 
    currencyResourceHandler(controller, async (currencyController, ctx, id) => {
      return await currencyController.getAccount(ctx, id)
    }, AccountSerializer, {
      include: ["currency"]
    })
  )

  // Update account
  router.patch('/:code/accounts/:id', auth(Scope.Accounting), checkExact(Validators.isUpdateAccount()), 
    currencyInputHandler(controller, async (currencyController, ctx, data: UpdateAccount) => {
      return await currencyController.updateAccount(ctx, data)
    }, AccountSerializer)
  )

  // Get account settings
  router.get('/:code/accounts/:id/settings', auth(Scope.Accounting),
    currencyResourceHandler(controller, async (currencyController, ctx, id) => {
      return await currencyController.getAccountSettings(ctx, id)
    }, AccountSettingsSerializer, {})
  )

  // Update account settings
  router.patch('/:code/accounts/:id/settings', auth(Scope.Accounting), checkExact(Validators.isUpdateAccountSettings()),
    currencyInputHandler(controller, async (currencyController, ctx, data: AccountSettings) => {
      return await currencyController.updateAccountSettings(ctx, data)
    }, AccountSettingsSerializer)
  )
  // Delete account.
  router.delete('/:code/accounts/:id', auth(Scope.Accounting), asyncHandler(async (req, res) => {
    const currencyController = await controller.getCurrencyController(req.params.code)
    await currencyController.deleteAccount(context(req), req.params.id)
    res.status(204).end()
  }))

  // Create transfer
  router.post('/:code/transfers', auth(Scope.Accounting), checkExact(Validators.isCreateTransfer()), 
    currencyInputHandler(controller, async (currencyController, ctx, data: InputTransfer) => {
      return await currencyController.createTransfer(ctx, data)
    }, TransferSerializer)
  )

  router.patch('/:code/transfers/:id', auth(Scope.Accounting), checkExact(Validators.isUpdateTransfer()),
    currencyInputHandler(controller, async (currencyController, ctx, data: UpdateTransfer) => {
      return await currencyController.updateTransfer(ctx, data)
    }, TransferSerializer)
  )

  router.get('/:code/transfers/:id', auth(Scope.Accounting), 
    currencyResourceHandler(controller, async (currencyController, ctx, id) => {
      return await currencyController.getTransfer(ctx, id)
    }, TransferSerializer, {
      include: ["currency", "payer", "payee"]
    })
  )

  router.get('/:code/transfers', auth(Scope.Accounting),
    currencyCollectionHandler(controller, async (currencyController, ctx, params) => {
      return await currencyController.getTransfers(ctx, params)
    }, TransferSerializer, {
      filter: ["payer", "payee"],
      sort: ["created", "updated"],
      include: ["payer", "payee"]
    })
  )

  return router

}