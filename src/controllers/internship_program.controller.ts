import { NextFunction, Request, Response } from "express";
import InternshipProgramService from "@/services/internship_program.service";
import { InternshipProgram } from "@/interfaces/internship_program.interface";

class InternshipProgramController {
	public service = new InternshipProgramService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: InternshipProgram[] = await this.service.findAll();

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
			const data: InternshipProgram = await this.service.findById(id);

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
			const param: InternshipProgram = req.body;
			const data: InternshipProgram = await this.service.create(param);

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
			const param: InternshipProgram = req.body;
			const data: InternshipProgram = await this.service.update(id, param);

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
			const deleteData: InternshipProgram = await this.service.delete(
				req.params.id,
			);

			res.status(204).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default InternshipProgramController;
