import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import CompanyController from "@/controllers/company.controller";
import { CreateCompanyDto } from "@/dtos/company.dto";

class CompanyRoute implements Routes {
  public path = `${BASE_PATH}/company`;
  public router = Router();
  public controller = new CompanyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateCompanyDto, "body"), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, validationMiddleware(CreateCompanyDto, "body", true), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default CompanyRoute;
