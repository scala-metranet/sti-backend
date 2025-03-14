import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import InternshipProgramController from "@/controllers/internship_program.controller";
import { CreateInternshipProgramDto } from "@/dtos/internship_program.dto";

class InternshipProgramRoute implements Routes {
  public path = `${BASE_PATH}/internship-program`;
  public router = Router();
  public controller = new InternshipProgramController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateInternshipProgramDto, "body"), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, validationMiddleware(CreateInternshipProgramDto, "body", true), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default InternshipProgramRoute;
