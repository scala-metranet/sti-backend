import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import CampusController from "@/controllers/campus.controller";

class CampusRoute implements Routes {
  public path = `${BASE_PATH}/campus`;
  public router = Router();
  public controller = new CampusController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.controller.get);
    this.router.get(`${this.path}/mitra`, this.controller.getMitra);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}/register`, this.controller.register);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default CampusRoute;
