import { Router } from "express";
import RolesController from "@controllers/roles.controller";
//import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import { BASE_PATH } from "@config";
import { CreateRoleDto } from "@/dtos/roles.dto";
import authMiddleware from "@middlewares/auth.middleware";
class RolesRoute implements Routes {
  public path = `${BASE_PATH}/roles`;
  public router = Router();
  public rolesController = new RolesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.rolesController.getRoles);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateRoleDto, "body"), this.rolesController.createRole);
    // this.router.get(`${this.path}/:id(\\d+)`, this.usersController.getUserById);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, validationMiddleware(CreateRoleDto, "body", true), this.rolesController.updateRole);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.rolesController.deleteById);
  }
}

export default RolesRoute;
