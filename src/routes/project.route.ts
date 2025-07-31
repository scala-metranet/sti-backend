import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import ProjectController from "@/controllers/project.controller";
import { CreateProjectDto, UpdateProjectDto } from "@/dtos/project.dto";

class ProjectRoute implements Routes {
  public path = `${BASE_PATH}/project`;
  public router = Router();
  public controller = new ProjectController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateProjectDto, "body"), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, validationMiddleware(UpdateProjectDto, "body", true), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default ProjectRoute;