import express from 'express'
const paymentRouter = express.Router()


import PaymentController from '../../adapters/controllers/paymentController'
import PaymentUseCase from '../../use-case/paymentUseCase'
import StripePayment from '../utils/stripPayment'
import PaymentRepository from '../repository/paymentRepository'
import userAuth from '../middlewares/userAuth'
import serviceProviderAuth from '../middlewares/serviceProviderAuth'
import WalletRepository from '../repository/walletRepository'


const stripe = new StripePayment()
const paymentRepository = new PaymentRepository()
const walletRepository = new WalletRepository()


const useCase = new PaymentUseCase(stripe, paymentRepository,walletRepository)  
const controller = new PaymentController(useCase)

paymentRouter.post('/create-payment', userAuth, (req, res, next) => controller.makePayment(req, res, next))

paymentRouter.post('/webhook', express.raw({type: ['application/json', 'application/json; charset=utf-8']}), (req, res, next ) => controller.handleWebhook(req, res, next))


paymentRouter.post('/cancelBooking/:id', userAuth, (req, res, next) => controller.cancelBooking(req, res, next));

paymentRouter.post('/refund/:id', serviceProviderAuth, (req, res, next) => controller.processRefund(req, res, next));



export default paymentRouter  