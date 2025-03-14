import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import multer from "multer";
import GraduationController from "@/controllers/graduation.controller";
const upload = multer({ dest: "uploads/" });

class GraduationRoute implements Routes {
  public path = `${BASE_PATH}/graduation`;
  public router = Router();
  public controller = new GraduationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.getGraduation);
    this.router.get(`${this.path}/count`, authMiddleware, this.controller.getCountGraduation);
    this.router.get(`${this.path}/current`, authMiddleware, this.controller.getCurrentGraduation);
    this.router.get(`${this.path}/event`, authMiddleware, this.controller.getGraduationEvent);
    this.router.get(`${this.path}/event/current`, authMiddleware, this.controller.getCurrentGraduationEvent);
    this.router.post(`${this.path}`, upload.any(), authMiddleware, this.controller.createGraduation);
    this.router.post(`${this.path}/event`, upload.any(), authMiddleware, this.controller.createGraduationEvent);
    this.router.post(`${this.path}/update-status/:id(\\w+)`, upload.any(), authMiddleware, this.controller.update);
  }
}

export default GraduationRoute;
