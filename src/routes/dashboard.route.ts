import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { BASE_PATH } from "@config";
import authMiddleware from "@middlewares/auth.middleware";
import DashboardController from "@/controllers/dashboard.controller";

class DashboardRoute implements Routes {
  public path = `${BASE_PATH}/dashboard`;
  public pathLeaderboard = `${BASE_PATH}/leaderboard`;

  public router = Router();
  public controller = new DashboardController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/admin`, authMiddleware, this.controller.getSummaryAdmin);
    this.router.get(`${this.path}/summary`, authMiddleware, this.controller.getSummary);

    this.router.get(`${this.pathLeaderboard}`, authMiddleware, this.controller.getLeaderboard);
    this.router.get(`${this.pathLeaderboard}/mentor`, authMiddleware, this.controller.getLeaderboardMentor);
    this.router.get(`${this.pathLeaderboard}/rekapitulasi`, authMiddleware, this.controller.getLeaderboardRekap);

  }
}

export default DashboardRoute;
