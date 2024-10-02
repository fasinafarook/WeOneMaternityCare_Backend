import express from "express";
import AdminController from "../../adapters/controllers/adminController";
import AdminRepository from "../repository/adminRepository";
import AdminUseCase from "../../use-case/adminUseCase";
import JwtToken from "../utils/JwtToken";
import adminAuthenticate from "../middlewares/adminAuth";
import MailService from "../utils/mailService";
import { uploadStorage } from "../middlewares/multer";
import FileStorageService from "../utils/fileStorageService";

const adminRouter = express.Router();

const jwt = new JwtToken(process.env.JWT_SECRET as string);
const adminRepository = new AdminRepository();
const mailService = new MailService();
const fileStorage = new FileStorageService();

const adminCase = new AdminUseCase(
  adminRepository,
  jwt,
  mailService,
  fileStorage
);

const controller = new AdminController(adminCase);

adminRouter.post("/login", (req, res, next) =>
  controller.login(req, res, next)
);
adminRouter.post("/logout", (req, res, next) =>
  controller.logout(req, res, next)
);

adminRouter.get("/users-list", adminAuthenticate, (req, res, next) =>
  controller.getAllUsers(req, res, next)
);
adminRouter.put("/block-user/:id", adminAuthenticate, (req, res, next) =>
  controller.blockUser(req, res, next)
);

adminRouter.get("/serviceProviders-list", adminAuthenticate, (req, res, next) =>
  controller.getAllServiceProviders(req, res, next)
);
adminRouter.get("/serviceProvider/:id", adminAuthenticate, (req, res, next) =>
  controller.getServiceProviderDetails(req, res, next)
);

adminRouter.put(
  "/approve-serviceProvider/:id",
  adminAuthenticate,
  (req, res, next) => controller.approveServiceProviders(req, res, next)
);
adminRouter.put("/block-provider/:id", adminAuthenticate, (req, res, next) =>
  controller.blockProvider(req, res, next)
);

adminRouter.post("/add-category", adminAuthenticate, (req, res, next) =>
  controller.addCategory(req, res, next)
);
adminRouter.get("/categorys-list", adminAuthenticate, (req, res, next) =>
  controller.findAllCategories(req, res, next)
);
adminRouter.put("/unlist-category/:id", adminAuthenticate, (req, res, next) =>
  controller.unlistCategory(req, res, next)
);

adminRouter.post(
  "/add-blogs",
  adminAuthenticate,
  uploadStorage.single("image"),
  (req, res, next) => controller.addBlog(req, res, next)
);
adminRouter.get("/blogs", adminAuthenticate, (req, res, next) =>
  controller.listBlogs(req, res, next)
);
adminRouter.put("/unlist-blog/:id", adminAuthenticate, (req, res, next) =>
  controller.unlistBlog(req, res, next)
);
adminRouter.put("/blog/:blogId", adminAuthenticate, (req, res, next) =>
  controller.updateBlogStatus(req, res, next)
);

adminRouter.post(
  "/add-webinars",
  adminAuthenticate,
  uploadStorage.fields([{ name: "thumbnail" }, { name: "video" }]),
  (req, res, next) => controller.addWebinar(req, res, next)
);
adminRouter.get("/webinars", adminAuthenticate, (req, res, next) =>
  controller.listWebinars(req, res, next)
);
adminRouter.put("/webinars/unlist/:webinarId", (req, res, next) =>
  controller.unlistWebinar(req, res, next)
);
adminRouter.put(
  "/webinars/toggle-listing/:id",
  adminAuthenticate,
  (req, res, next) => controller.toggleWebinarListing(req, res, next)
);

adminRouter.get('/complaints', adminAuthenticate,
  (req, res, next) => controller.getAllComplaints(req, res, next)
);

adminRouter.put('/respond-to-complaint/:id',  adminAuthenticate,
  (req, res, next) => controller.respondToComplaint(req, res, next)
);


adminRouter.get("/bookings",  adminAuthenticate,
  (req, res, next) => controller.getAdminBookingsController(req, res, next)
);

adminRouter.get('/dashboard', adminAuthenticate, (req, res, next) => controller.getDashboardDetails(req, res, next))


export default adminRouter;
