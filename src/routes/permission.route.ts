import { Router } from "express";
//import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import PermissionController from "@/controllers/permission.controller";
class PermissionRoute implements Routes {
  public path = `${BASE_PATH}/permission`;
  public router = Router();
  public controller = new PermissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/user`, authMiddleware, this.controller.getUser);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
  }
}

export default PermissionRoute;
