import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import multer from "multer";
import ClassesController from "@/controllers/classes.controller";
import { adminGuardMiddleware } from "@/middlewares/guard.middleware";
const upload = multer({ dest: "uploads/" });

class ClassesRoute implements Routes {
  public path = `${BASE_PATH}/class`;
  public router = Router();
  public controller = new ClassesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.controller.get);
    this.router.get(`${this.path}/mentee/:id(\\w+)`, this.controller.detailMentee);
    this.router.get(`${this.path}/:id`, this.controller.detail);
    this.router.post(`${this.path}/`, authMiddleware,upload.any(), this.controller.create);
    this.router.post(`${this.path}/registration`, this.controller.registration);
    this.router.post(`${this.path}/resend-email`, this.controller.resendEmail);
    this.router.put(`${this.path}/:id(\\w+)`,  authMiddleware, adminGuardMiddleware, upload.any(), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, adminGuardMiddleware, this.controller.delete);
  }
}

export default ClassesRoute;
