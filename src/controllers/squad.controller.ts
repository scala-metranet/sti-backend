import { NextFunction, Request, Response } from "express";
import SquadService from "@/services/squad.service";
import { Squad } from "@/interfaces/squad.interface";

class SquadController {
	public service = new SquadService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Squad[] = await this.service.findAll();

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

	public getByMitra = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data:any = await this.service.findByMitra({..._req.query,
				page: page,
				perPage: perPage
			});

			res.status(200).json({
				data: data.results,
				pagination: {
					total: data.total,
					page: page,
					perPage: perPage,
				},
				message: "findAll",
			});
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
			const data: Squad = await this.service.create({...param,mentor_id:req['user'].id});

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
			const param: Squad = req.body;
			const data: Squad = await this.service.update(id, param, req['user']);

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
			const deleteData: Squad = await this.service.delete(req.params.id, req['user']);

			res.status(200).json({ data: deleteData, message: "Data deleted." });
		} catch (error) {
			next(error);
		}
	};
}

export default SquadController;
