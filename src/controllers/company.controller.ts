import { NextFunction, Request, Response } from "express";
import CompanyService from "@/services/company.service";
import { Company } from "@/interfaces/company.interface";
import { CreateCompanyDto } from "@/dtos/company.dto";

class CompanyController {
	public service = new CompanyService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Company[] = await this.service.findAll();

			res.status(200).json({ data: data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

	public detail = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id: string = req.params.id;
			const data: Company = await this.service.findById(id);

			res.status(200).json({ data: data, message: "findOne" });
		} catch (error) {
			next(error);
		}
	};

	public create = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: CreateCompanyDto = req.body;
			const data: Company = await this.service.create(param);

			res.status(201).json({ data: data, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public update = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id: string = req.params.id;
			const param: Company = req.body;
			const data: Company = await this.service.update(id, param);

			res.status(200).json({ data: data, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public delete = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const deleteData: Company = await this.service.delete(req.params.id);

			res.status(204).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default CompanyController;
