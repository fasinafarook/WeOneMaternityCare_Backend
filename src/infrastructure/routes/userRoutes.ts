import express from "express";
const router = express.Router();
import UserController from "../../adapters/controllers/UserController";
import UserUseCase from "../../use-case/userUse-case";
import UserRepository from "../repository/userRepository";
import HashPassword from "../utils/hashPassword";
import AppError from "../utils/appError";
import JwtToken from "../utils/JwtToken";
import OtpGenerate from "../utils/generateOtp";
import MailService from "../utils/mailService";
import userAuth from "../middlewares/userAuth";
import WalletRepository from "../repository/walletRepository";

const userRepository = new UserRepository();
const otp = new OtpGenerate();
const jwt = new JwtToken(process.env.JWT_SECRET as string);
const mail = new MailService();
const hashPassword = new HashPassword();
const walletRepository = new WalletRepository();

const userCase = new UserUseCase(
  userRepository,
  otp,
  jwt,
  mail,
  hashPassword,
  walletRepository
);
const controller = new UserController(userCase);

router.post("/client-register", (req, res, next) => {
  controller.verifyUserEmail(req, res, next);
});
router.post("/verify-otp", (req, res, next) =>
  controller.verifyOtp(req, res, next)
);
router.post("/resend-otp", (req, res, next) =>
  controller.resendOtp(req, res, next)
);
router.post("/verify-login", (req, res, next) =>
  controller.verifyLogin(req, res, next)
);

router.get("/home", userAuth, (req, res, next) =>
  controller.home(req, res, next)
);
router.post("/logout", userAuth, (req, res, next) =>
  controller.logout(req, res, next)
);

router.get("/get-profile", userAuth, (req, res, next) =>
  controller.getProfileDetails(req, res, next)
);
router.put("/edit-profile", userAuth, (req, res, next) =>
  controller.editProfile(req, res, next)
);
router.put("/edit-password", userAuth, (req, res, next) =>
  controller.editPassword(req, res, next)
);

router.get("/service-providers", userAuth, (req, res, next) =>
  controller.getApprovedAndUnblockedProviders(req, res, next)
);

router.get("/categories", (req, res, next) =>
  controller.getCategories(req, res, next)
);

router.get("/serviceProviderDetails/:id", userAuth, (req, res, next) =>
  controller.getServiceProviderDetails(req, res, next)
);

router.get(
  "/get-service-providers-slots-details/:serviceProviderId",
  (req, res, next) => controller.getProviderSlotsDetails(req, res, next)
);

router.get("/get-scheduled-Bookings", userAuth, (req, res, next) =>
  controller.getScheduledBookingList(req, res, next)
);

router.get("/webinars", userAuth, (req, res, next) =>
  controller.getListedWebinars(req, res, next)
);
router.get("/blogs", userAuth, (req, res, next) =>
  controller.getBlogs(req, res, next)
);

router.get("/wallet", userAuth, (req, res, next) =>
  controller.getWallet(req, res, next)
);

router.post("/complaints", userAuth, (req, res) =>
  controller.fileComplaint(req, res)
);
router.get("/complaints/:userId", userAuth, (req, res) =>
  controller.getUserComplaints(req, res)
);

router.post("/forgot-password", (req, res, next) =>
  controller.forgotPassword(req, res, next)
);

router.post("/reset-password", (req, res, next) =>
  controller.resetPassword(req, res, next)
);

router.get("/message", userAuth, controller.getUsersForSidebar);
router.get("/completed/:userId", userAuth, controller.getCompletedBookings);

export default router;
