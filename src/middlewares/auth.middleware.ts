import { NextFunction, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { RequestWithUser } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import { importSPKI, jwtVerify } from "jose";
import TokenService from "@/services/token.service";
import path from "path";
import fs from "fs";
import UserService from "@/services/users.service";
import { Token } from "@/interfaces/token.interface";

const authMiddleware = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies["Authorization"] || (req.header("Authorization") ? req.header("Authorization").split("Bearer ")[1] : null);
    const JWT_ISSUER = "levelup";
    const JWT_AUDIENCE = "levelup";
    if (Authorization) {
      const keyPath = path.join(__dirname, "../../keys/eddsa-public.pem");
      const publicKey = fs.readFileSync(keyPath, "utf8");
      const importedPublicKey = await importSPKI(publicKey, "EdDSA");
      const { payload } = await jwtVerify(Authorization, importedPublicKey, {
        issuer: JWT_AUDIENCE,
        audience: JWT_ISSUER,
      });
      const tokenService: TokenService = new TokenService();
      const userId: string = payload.sub;

      const token: Token[] = await tokenService.findByKey(payload.prm as string);

      if (!token.length) next(new HttpException(401, "Token expired, please re-login"));

      const userService = new UserService();
      const findUser: User = await userService.findUserById(userId);

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(401, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
