import { NextFunction, Request, Response } from "express";
import { Squad } from "@/interfaces/squad.interface";
import ScheduleService from "@/services/schedule.service";

class ScheduleController {
	public service = new ScheduleService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const param = {..._req.query,page,perPage}
			const data: any[] = await this.service.findAll(param);

			res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
			next(error);
		}
	};

	public getByMentor = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Squad[] = await this.service.findByMentor(_req["user"].id);

			res.status(200).json({ data: data, message: "Get data successfull." });
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
			const data: Squad = await this.service.findById(id);

			res.status(200).json({ data: data, message: "Get detail successfull." });
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
			const param: any = req.body;
			const data: any = await this.service.create({...param});

			res.status(201).json({ data: data, message: "Data created." });
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
			const param: any = req.body;
			const data: any = await this.service.update(id, param);

			res.status(200).json({ data: data, message: "Data updated." });
		} catch (error) {
			next(error);
		}
	};

	public updateSession = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id: string = req.params.id;
			const param: any = req.body;
			const data: any = await this.service.updateSession(id, param);

			res.status(200).json({ data: data, message: "Data updated." });
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
			const deleteData: any = await this.service.delete(req.params.id);

			res.status(200).json({ data: deleteData, message: "Data deleted." });
		} catch (error) {
			next(error);
		}
	};

	public deleteSession = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const deleteData: any = await this.service.deleteSession(req.params.id);

			res.status(200).json({ data: deleteData, message: "Data deleted." });
		} catch (error) {
			next(error);
		}
	};
}

export default ScheduleController;
