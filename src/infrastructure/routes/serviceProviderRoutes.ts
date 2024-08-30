import express from "express";
const serviceProvider = express.Router();

import ServiceProviderController from "../../adapters/controllers/ServiceProviderController";
import ServiceProviderRepository from "../repository/serviceProviderRepository";
import ServiceProviderUseCase from "../../use-case/ServiceProviderUse-case";
import OtpGenerate from "../utils/generateOtp";
import MailService from "../utils/mailService";
import JwtToken from "../utils/JwtToken";
import HashPassword from "../utils/hashPassword";
import serviceProviderAuth from "../middlewares/serviceProviderAuth";
import { uploadStorage } from "../middlewares/multer";
import FileStorageService from "../utils/fileStorageService";
import WalletRepository from "../repository/walletRepository";




const otp = new OtpGenerate()
const hash = new HashPassword()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()
const fileStorage = new FileStorageService()
const walletRepository = new WalletRepository()




const serviceProviderRespository = new ServiceProviderRepository()

const serviceProviderCase = new ServiceProviderUseCase(serviceProviderRespository, otp, jwt, mail, hash,fileStorage,walletRepository)
const controller = new ServiceProviderController(serviceProviderCase)



serviceProvider.post('/serviceProvider-register', uploadStorage.single('experienceCrt'), (req, res, next) => {
    controller.verifyServiceProviderEmail(req, res, next);
  });
serviceProvider.post('/verify-otp', (req, res, next) => controller.verifyOtp(req, res, next))
serviceProvider.post('/verify-login', (req, res, next) => controller.verifyLogin(req, res, next))  
serviceProvider.post('/resend-otp', (req, res, next) => controller.resendOtp(req, res, next))

// router.post('/logout', (req, res, next) => controller.logout(req, res, next))


serviceProvider.post('/verify-details', serviceProviderAuth, uploadStorage.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'experienceCrt', maxCount: 1 },
   
]), (req, res, next) => controller.verifyDetails(req, res, next));

serviceProvider.post('/logout', serviceProviderAuth,(req, res, next) => controller.logout(req, res, next))

serviceProvider.get("/categories", (req, res, next) => controller.getCategories(req, res, next))
serviceProvider.get('/profile',serviceProviderAuth, (req, res, next) => controller.getProfileDetails(req, res, next))


serviceProvider.post('/add-slot', serviceProviderAuth, (req, res, next) => controller.addProviderSlot(req, res, next))

serviceProvider.get('/get-slots', serviceProviderAuth, (req, res, next) => controller.getProviderSlots(req, res, next))

serviceProvider.get('/get-domains', serviceProviderAuth, (req, res, next) => controller.getDomains(req, res, next))

serviceProvider.get('/get-scheduled-bookings', serviceProviderAuth, (req, res, next) => controller.getScheduledBookings(req, res, next))

serviceProvider.put('/update-wallet', serviceProviderAuth, (req, res, next) => controller.updateWallet(req, res, next))

serviceProvider.get('/getPaymentDashboardDetails', serviceProviderAuth, (req, res, next) => controller.getPaymentDashboard(req, res, next))

export default serviceProvider