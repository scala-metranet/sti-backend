import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import multer from "multer";
import NewsController from "@/controllers/news.controller";
const upload = multer({ dest: "uploads/" });

class NewsRoute implements Routes {
  public path = `${BASE_PATH}/news`;
  public router = Router();
  public controller = new NewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.controller.get);
    this.router.get(`${this.path}/:id`, this.controller.detail);
    this.router.post(`${this.path}/`, authMiddleware,upload.any(), this.controller.create);
    this.router.put(`${this.path}/:id(\\w+)`, authMiddleware, upload.any(), this.controller.update);
    this.router.delete(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.delete);
  }
}

export default NewsRoute;
