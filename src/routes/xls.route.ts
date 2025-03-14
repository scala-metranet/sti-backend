import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import authMiddleware from "@middlewares/auth.middleware";
import { BASE_PATH } from "@config";
import XlsController from "@/controllers/xls.controller";

class XlsRoute implements Routes {
	public path = `${BASE_PATH}/xls`;
	public router = Router();
	public controller = new XlsController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			`${this.path}/format`,
			authMiddleware,
			this.controller.format,
		);

		this.router.post(
			`${this.path}/format-csv`,
			authMiddleware,
			this.controller.formatCsv,
		);
	}
}

export default XlsRoute;
