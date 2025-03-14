import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import ScheduleController from "@/controllers/schedule.controller";

class ScheduleRoute implements Routes {
  public path = `${BASE_PATH}/schedule`;
  public router = Router();
  public controller = new ScheduleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/mentor`, authMiddleware, this.controller.getByMentor);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.put(`${this.path}/session/:id(\\w+)`, authMiddleware, this.controller.updateSession);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
    this.router.delete(`${this.path}/session/:id(\\w+)`, authMiddleware, this.controller.deleteSession);
  }
}

export default ScheduleRoute;
