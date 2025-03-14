import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import MitraController from "@/controllers/mitra.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

class MitraRoute implements Routes {
  public path = `${BASE_PATH}/mitra`;
  public router = Router();
  public controller = new MitraController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.controller.get);
    this.router.get(`${this.path}/detail`, authMiddleware, this.controller.detail);
    this.router.get(`${this.path}/filter-company`, this.controller.companyFilter);
    this.router.post(`${this.path}`, authMiddleware, upload.any(), this.controller.create);
    this.router.post(`${this.path}/delete`, authMiddleware, this.controller.delete);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.put(`${this.path}/update-detail/:id(\\w+)`, authMiddleware, upload.any(), this.controller.updateDetail);
    this.router.put(`${this.path}/update-pic/:id(\\w+)`, authMiddleware, upload.any(), this.controller.updatePic);
    this.router.put(`${this.path}/update-program/:id(\\w+)`, authMiddleware, upload.any(), this.controller.updateProgram);
    // this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default MitraRoute;
