import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import AuthService from "@services/auth.service";
import { randomBytes } from "crypto";
import TokenService from "@/services/token.service";
import SupabaseProvider from "@/utils/supabase";
// import { redisClient } from "@/utils/redis";
import axios from "axios";
import { CF_SECRET_KEY } from "@/config";
class AuthController {
  public authService = new AuthService();
  public tokenService = new TokenService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
    try {
      const supabase = new SupabaseProvider();
      const errors: unknown[] = [];
      let photo: any = null;
      console.log(req);
      if (req.files != undefined && req.files != null) {
        const files: any = Object.entries(req.files);
        for (const [key, value] of files) {
          const filepath = value.path;
          const contentType: string = value.mimetype;
          const { data, error }: any = await supabase.upload(key, filepath, contentType);
          if (error) errors.push(error);
          else photo = data.publicUrl;
        }
        if (errors.length) return res.status(400).send(errors);
      }
      let userData: any = req.body;
      if (photo) {
        userData = { ...userData, photo: photo };
      }

      const signUpUserData: User = await this.authService.register(userData);
      res.status(201).json({ data: signUpUserData, message: "Register successful." });
    } catch (error) {
      next(error);
    }
  };

  public verification = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
    try {
      const supabase = new SupabaseProvider();
      const errors: unknown[] = [];
      const attachment: any = {};
      console.log(req);
      if (req.files != undefined && req.files != null) {
        const files: any = Object.entries(req.files);
        for (const [key, value] of files) {
          const filepath = value.path;
          const contentType: string = value.mimetype;
          const { data, error }: any = await supabase.upload(key, filepath, contentType);
          if (error) errors.push(error);
          else attachment[value.fieldname] = data.publicUrl;
        }
        if (errors.length) return res.status(400).send(errors);
      }

      const userData: any = req.body;
      const data: User = await this.authService.verification(userData, attachment);
      res.status(201).json({ data, message: "Verification successful." });
    } catch (error) {
      next(error);
    }
  };

  public resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: any = await this.authService.resendOtp(req["user"]);
      res.status(200).json({ data, message: "Forget Password successful." });
    } catch (error) {
      next(error);
    }
  };

  public sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: any = await this.authService.sendOtp(req.body);
      res.status(200).json({ data, message: "Send OTP successful." });
    } catch (error) {
      next(error);
    }
  };

  public verifOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const param: any = req.body;

      const data: any = await this.authService.verifOtp({ ...param, ...req["user"] });
      res.status(200).json({ data, message: "Forget Password successful." });
    } catch (error) {
      next(error);
    }
  };

  public forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: any = req.body;

      const data: any = await this.authService.forgetPassword(userData);
      res.status(200).json({ data, message: "Forget Password successful." });
    } catch (error) {
      next(error);
    }
  };

  public updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: any = req.body;

      const data = await this.authService.updatePassword(userData);
      res.status(200).json({ data, message: "Forget Password successful." });
    } catch (error) {
      next(error);
    }
  };

  public checkForgetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.authService.checkForgetToken(req.body);
      res.status(200).json({ data, message: "Token valid." });
    } catch (error) {
      next(error);
    }
  };

  public test = async (res: Response): Promise<void> => {
    res.status(200).json("ok");
  };

  public siteVerify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const param: any = req.body;
      const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const result = await axios.post(url,{response:param.token,secret:CF_SECRET_KEY})
      console.log('result',result.data)
      res.status(200).json({ response: result.data, message: "Verify successful." });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      const userData: any = req.body;

      const data = await this.authService.login({ ...userData, ip: ip });
      // remove limiter in redis for this IP address
      // redisClient.del(req.ip);
      res.status(200).json({ data, message: "Login successful." });
    } catch (error) {
      next(error);
    }
  };

  public impersonate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      const userData: any = { ...req.body, user_id: req["user"].id };

      const data = await this.authService.impersonate({ ...userData, ip: ip });
      res.status(200).json({ data, message: "Login successful." });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      await this.authService.logout(userData);
      res.status(200).json({ message: "Logout successful." });
    } catch (error) {
      next(error);
    }
  };
  public refreshToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      // rome-ignore lint/performance/noDelete: <explanation>
      delete userData.password;
      const accessKey = randomBytes(16).toString("hex");
      const refreshKey = randomBytes(16).toString("hex");

      await this.tokenService.removeByUserId(userData.id);
      await this.tokenService.saveToken(userData.id, accessKey, refreshKey);
      const tokens = this.tokenService.generateTokens(userData, accessKey, refreshKey);

      res.status(200).json({ message: "Success refresh token.", data: tokens });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
