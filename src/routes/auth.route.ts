import { Router } from "express";
import AuthController from "@controllers/auth.controller";
// import { LoginUserDto } from "@dtos/users.dto";
import { Routes } from "@interfaces/routes.interface";
import authMiddleware from "@middlewares/auth.middleware";
// import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import multer from "multer";
// import { customRedisRateLimiter } from "@/middlewares/rate_limiter.middleware";
// import rateLimit from 'express-rate-limit'
const upload = multer({ dest: "uploads/" });

// const apiLimiter = rateLimit({
// 	windowMs: 60 * 60 * 1000,
// 	max: 5,
// 	message: "You have reached maximum retries. Please try again later",
// 	statusCode: 429,
// 	headers: true,
// 	keyGenerator(req:any) {
// 	  return req.clientIp;
// 	},
// });

class AuthRoute implements Routes {
  public path = `${BASE_PATH}`;
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //this.router.post(`${this.path}signup`, validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post(
      `${this.path}/login`,
      // apiLimiter,
      // customRedisRateLimiter,
      // validationMiddleware(LoginUserDto, "body"),
      this.authController.logIn,
    );
    this.router.post(`${this.path}/impersonate`, authMiddleware, this.authController.impersonate);
    this.router.post(`${this.path}/forget-password`, this.authController.forgetPassword);
    this.router.post(`${this.path}/update-password`, this.authController.updatePassword);
    this.router.post(`${this.path}/check-token-password`, this.authController.checkForgetToken);
    this.router.post(`${this.path}/register`, upload.any(), this.authController.register);
    this.router.post(`${this.path}/verification`, upload.any(), this.authController.verification);
    this.router.post(`${this.path}/logout`, authMiddleware, this.authController.logOut);
    this.router.post(`${this.path}/token/refresh`, authMiddleware, this.authController.refreshToken);
    this.router.get(`${this.path}/test`, authMiddleware, this.authController.test);
    this.router.post(`${this.path}/siteverify`, this.authController.siteVerify);
    this.router.post(`${this.path}/otp-auth/send`, this.authController.sendOtp);
    this.router.post(`${this.path}/otp/resend`, authMiddleware, this.authController.resendOtp);
    this.router.post(`${this.path}/otp/verify`, authMiddleware, this.authController.verifOtp);
  }
}

export default AuthRoute;
