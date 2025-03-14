import { NextFunction, Request, Response } from "express";
import { UserInternshipDocument } from "@/interfaces/user_internship_document.interface";
import UserInternshipDocumentService from "@/services/user_internship_document.service";

class UserInternshipDocumentController {
	public service = new UserInternshipDocumentService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: UserInternshipDocument[] = await this.service.findAll();

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
			const data: UserInternshipDocument = await this.service.findById(id);

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
			const param: UserInternshipDocument = req.body;
			const data: UserInternshipDocument = await this.service.create(param);

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
			const param: UserInternshipDocument = req.body;
			const data: UserInternshipDocument = await this.service.update(id, param);

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
			const deleteData: UserInternshipDocument = await this.service.delete(
				req.params.id,
			);

			res.status(200).json({ data: deleteData, message: "Data deleted." });
		} catch (error) {
			next(error);
		}
	};
}

export default UserInternshipDocumentController;
