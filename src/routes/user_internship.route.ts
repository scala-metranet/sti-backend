import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import UserInternshipController from "@/controllers/user_internship.controller";
import { CreateUserInternshipDto } from "@/dtos/user_internship.dto";

class UserInternshipRoute implements Routes {
  public path = `${BASE_PATH}/user-internship`;
  public router = Router();
  public controller = new UserInternshipController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateUserInternshipDto, "body"), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, validationMiddleware(CreateUserInternshipDto, "body", true), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default UserInternshipRoute;
