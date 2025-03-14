import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { RoleName } from "@/dtos/roles.dto";

export const adminGuardMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req["user"];
    if (user.role.name === RoleName.super_admin || user.id === req.params.id){
      next();
    }else{
      next(new HttpException(403, "Forbidden access"));
    }
  } catch (error) {
    next(new HttpException(422, "Unknown entity"));
  }
};

export const adminMentorGuardMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req["user"];
    if (user.role.name === RoleName.super_admin || user.role.name === RoleName.mentor || user.id === req.params.id){
      next();
    }else{
      next(new HttpException(403, "Forbidden access"));
    }
  } catch (error) {
    next(new HttpException(422, "Unknown entity"));
  }
};

export const selfGuardMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req["user"];
    if (user.id === req.params.id){
      next();
    }else{
      next(new HttpException(403, "Forbidden access"));
    }
  } catch (error) {
    next(new HttpException(422, "Unknown entity"));
  }
};

export const guard = (roles: RoleName[]) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req["user"];
    if (!roles.length && user.id !== req.params.id) next(new HttpException(403, "Forbidden access"));
    roles.includes(user.role.name) || user.id == req.params.id ? next() : next(new HttpException(403, "Forbidden access"));
  } catch (error) {
    next(new HttpException(422, "Unknown entity"));
  }
};
