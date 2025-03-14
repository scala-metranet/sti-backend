import { Router } from "express";
import IndexController from "@controllers/index.controller";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@/middlewares/auth.middleware";
import validationMiddleware from "@/middlewares/validation.middleware";
import { LoginUserDto } from "@/dtos/users.dto";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

class IndexRoute implements Routes {
  public path = `${BASE_PATH}`;
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
    this.router.get(`${this.path}/protected`, authMiddleware, this.indexController.index);
    this.router.post(
      `${this.path}/upload`,
      upload.fields([
        { name: "cv", maxCount: 1 },
        { name: "portofolio", maxCount: 1 },
      ]),
      validationMiddleware(LoginUserDto, "body"),
      this.indexController.upload,
    );
  }
}

export default IndexRoute;
