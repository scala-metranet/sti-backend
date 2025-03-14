import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import JoinRequestController from "@/controllers/join_request.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
class JoinRequestRoute implements Routes {
  public path = `${BASE_PATH}/join-request`;
  public router = Router();
  public controller = new JoinRequestController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}/`,upload.any(), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default JoinRequestRoute;
