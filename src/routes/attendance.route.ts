import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import multer from "multer";
import AttendanceController from "@/controllers/attendance.controller";
const upload = multer({ dest: "uploads/" });

class AttendanceRoute implements Routes {
  public path = `${BASE_PATH}/attendance`;
  public router = Router();
  public controller = new AttendanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.post(`${this.path}`, upload.any(), authMiddleware, this.controller.create);
    this.router.get(`${this.path}/current`, authMiddleware, this.controller.getCurrent);
  }
}

export default AttendanceRoute;
