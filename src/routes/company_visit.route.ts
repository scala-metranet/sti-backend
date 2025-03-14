import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import CompanyVisitController from "@/controllers/company_visit.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

class CompanyVisitRoute implements Routes {
  public path = `${BASE_PATH}/company-visit`;
  public router = Router();
  public controller = new CompanyVisitController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.controller.get);
    this.router.get(`${this.path}/mentee/:id(\\w+)`, this.controller.detailMentee);
    this.router.get(`${this.path}/:id`, this.controller.detail);
    this.router.post(`${this.path}/`, authMiddleware,upload.any(), this.controller.create);
    this.router.post(`${this.path}/presence`, this.controller.createPresensi);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, upload.any(), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default CompanyVisitRoute;
