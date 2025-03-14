import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import ScoringController from "@/controllers/scoring.controller";

class ScoringRoute implements Routes {
  public path = `${BASE_PATH}/scoring`;
  public router = Router();
  public controller = new ScoringController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/master`, authMiddleware, this.controller.getMaster);
    this.router.get(`${this.path}/question`, authMiddleware, this.controller.get);
    this.router.get(`${this.path}/master/:id(\\w+)`, authMiddleware, this.controller.detailMaster);
    this.router.get(`${this.path}/question/:id(\\w+)`, authMiddleware, this.controller.detail);
    this.router.post(`${this.path}/master`, authMiddleware, this.controller.create);
    this.router.put(`${this.path}/master/:id(\\w+)`, authMiddleware, this.controller.update);
    this.router.delete(`${this.path}/master/:id(\\w+)`, authMiddleware, this.controller.delete);

    this.router.get(`${this.path}`, authMiddleware, this.controller.getScore);
    this.router.get(`${this.path}/form/:id(\\w+)`, authMiddleware, this.controller.scoreForm);
    this.router.get(`${this.path}/history`, authMiddleware, this.controller.getHistory);
    this.router.get(`${this.path}/:id(\\w+)`, authMiddleware, this.controller.detailScore);
    this.router.post(`${this.path}`, authMiddleware, this.controller.createScore);
    this.router.post(`${this.path}/rescore`, authMiddleware, this.controller.rescore);
    this.router.post(`${this.path}/rescore-all`, authMiddleware, this.controller.rescoreAll);

  }
}

export default ScoringRoute;
