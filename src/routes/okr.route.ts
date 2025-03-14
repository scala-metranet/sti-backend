import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import OkrController from "@/controllers/okr.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

class OkrRoute implements Routes {
  public path = `${BASE_PATH}/okr`;
  public router = Router();
  public controller = new OkrController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/mentor`, authMiddleware, this.controller.getByMentor);
    this.router.get(`${this.path}/squad/:id(\\w+)`, authMiddleware, this.controller.getBySquad);
    this.router.get(`${this.path}/task`, authMiddleware, this.controller.getTask);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}`, authMiddleware, this.controller.create);
    this.router.get(`${this.path}/sprint/activity/:id(\\w+)`, authMiddleware, this.controller.getSprintActivity);
    this.router.get(`${this.path}/sprint/mentee/assign/:id(\\w+)`, authMiddleware, this.controller.getSprintAssign);
    this.router.get(`${this.path}/sprint/mentee/:id(\\w+)`, authMiddleware, this.controller.getSprint);
    this.router.post(`${this.path}/sprint`, authMiddleware, this.controller.createSprint);
    this.router.post(`${this.path}/sprint/okr`, authMiddleware, this.controller.createSprintKr);
    this.router.put(`${this.path}/sprint/:id(\\w+)`, authMiddleware, this.controller.updateSprint);
    this.router.delete(`${this.path}/sprint/:id(\\w+)`, authMiddleware, this.controller.deleteSprint);

    this.router.post(`${this.path}/task/add`, authMiddleware, this.controller.createTask);
    this.router.post(`${this.path}/task/update`, authMiddleware, this.controller.updateTask);
    this.router.post(`${this.path}/task/upload`, upload.fields([{ name: "attachment", maxCount: 1 }]), authMiddleware, this.controller.uploadTask);
    this.router.post(`${this.path}/okr/input`, authMiddleware, this.controller.inputOkr);
    this.router.put(`${this.path}/okr/:id(\\w+)`, authMiddleware, this.controller.updateOkr);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/task/:id(\\w+)`, authMiddleware, this.controller.deleteTask);
    this.router.delete(`${this.path}/okr/:id(\\w+)`, authMiddleware, this.controller.deleteOkr);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default OkrRoute;
