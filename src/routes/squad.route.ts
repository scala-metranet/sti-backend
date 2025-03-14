import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import SquadController from "@/controllers/squad.controller";
import { CreateSquadDto } from "@/dtos/squad.dto";
import { guard } from "@/middlewares/guard.middleware";
import { RoleName } from "@/dtos/roles.dto";

class SquadRoute implements Routes {
  public path = `${BASE_PATH}/squad`;
  public router = Router();
  public controller = new SquadController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/mentor`, authMiddleware, this.controller.getByMentor);
    this.router.get(`${this.path}/mitra`, authMiddleware, this.controller.getByMitra);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
    this.router.put(
      `${this.path}/:id(\\w+)`,
      authMiddleware,
      validationMiddleware(CreateSquadDto, "body", true),
      guard([RoleName.super_admin, RoleName.mentor]),
      this.controller.update,
    );
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, guard([RoleName.super_admin, RoleName.mentor]), this.controller.delete);
  }
}

export default SquadRoute;
