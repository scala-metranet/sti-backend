import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import UserInternshipDocumentController from "@/controllers/user_internship_document.controller";
import { CreateUserInternshipDocumentDto } from "@/dtos/user_internship_document.dto";

class UserInternshipDocumentRoute implements Routes {
  public path = `${BASE_PATH}/user-internship-document`;
  public router = Router();
  public controller = new UserInternshipDocumentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateUserInternshipDocumentDto, "body"), this.controller.create);
    this.router.put(
      `${this.path}/:id(\\w+)`,
      authMiddleware,
      validationMiddleware(CreateUserInternshipDocumentDto, "body", true),
      this.controller.update,
    );
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default UserInternshipDocumentRoute;
