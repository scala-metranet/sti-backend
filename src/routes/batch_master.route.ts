import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import BatchMasterController from "@/controllers/batch_master.controller";
import SprintMasterController from "@/controllers/sprint_master.controller";

class BatchMasterRoute implements Routes {
  public path = `${BASE_PATH}/batch-master`;
  public sprintPath = `${BASE_PATH}/sprint-master`;

  public router = Router();
  public controller = new BatchMasterController();
  public sprintController = new SprintMasterController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/filter`, authMiddleware, this.controller.getFilter);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}/`, authMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);

    this.router.get(`${this.sprintPath}/`, authMiddleware, this.sprintController.get);
    this.router.get(`${this.sprintPath}/:id(\\w+)`, authMiddleware, this.sprintController.detail);
    this.router.post(`${this.sprintPath}/`, authMiddleware, this.sprintController.create);
    this.router.put(`${this.sprintPath}/:id(\\w+)`, authMiddleware, this.sprintController.update);
    this.router.delete(`${this.sprintPath}/:id(\\w+)`, authMiddleware, this.sprintController.delete);
  }
}

export default BatchMasterRoute;
