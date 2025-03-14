import { NextFunction, Request, Response } from "express";
import AuthService from "@services/auth.service";
import TokenService from "@/services/token.service";

class XlsController {
	public authService = new AuthService();
	public tokenService = new TokenService();

	public format = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const excel = require("exceljs");

			let workbook = new excel.Workbook();
			let worksheet = workbook.addWorksheet("format");

			const param = _req.body
			worksheet.columns = param.headerColumn;

			worksheet.addRows(param.dataExample)

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);

			res.setHeader(
				"Content-Disposition",
				"attachment; filename=" + "format.xlsx"
			);

			return workbook.xlsx.write(res).then(function () {
				res.status(200).end();
			});
		} catch (error) {
			next(error);
		}
	};

	public formatCsv = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const excel = require("exceljs");

			let workbook = new excel.Workbook();
			let worksheet = workbook.addWorksheet("format");

			const param = _req.body
			worksheet.columns = param.headerColumn;

			worksheet.addRows(param.dataExample)

			res.setHeader(
				"Content-Type",
				"text/csv"
			);

			res.setHeader(
				"Content-Disposition",
				"attachment; filename=" + "format.csv"
			);

			return workbook.csv.write(res).then(function () {
				res.status(200).end();
			});
		} catch (error) {
			next(error);
		}
	};
	
}

export default XlsController;
