import { NextFunction, Request, Response } from "express";
import { CreateCompanyDto } from "@/dtos/company.dto";
import CampusService from "@/services/campus.service";
import { Campus } from "@/interfaces/campus.interface";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { User } from "@/interfaces/users.interface";
import UserService from "@/services/users.service";
import { UserStatus } from "@/dtos/users.dto";

class CampusController {
	public service = new CampusService();
	public userService = new UserService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any[] = await this.service.findAll({..._req.query});

			res.status(200).json({ data: data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

	public getMitra = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any[] = await this.service.findMitra({..._req.query});

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
			const data: Campus = await this.service.findById(id);

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
			const data: Campus = await this.service.create(param);

			res.status(201).json({ data: data, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public register = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: any = req.body;
			const paramCampus:any = {
				name:param.name,
				address:param.address,
				phone:param.phone,
				email:param.email
			}
			const data: Campus = await this.service.create(paramCampus);
			const paramUser:any = {
				name:param.name,
				email:param.email,
				password: param.password,
				status: UserStatus.unverified,
				campus_id: data.id,
				role_id: 'Super Admin'
			}
			const createAdmin: User = await this.userService.createUser(paramUser)
			console.log(createAdmin)

			const emailProvider = new NodeMailerProvier();
			emailProvider.send({
				email:param.email,
				subject: 'Registrasi Akun Kampus',
				content: ''
			});

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
			const param: Campus = req.body;
			const data: Campus = await this.service.update(id, param);

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
			const deleteData: Campus = await this.service.delete(req.params.id);

			res.status(204).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default CampusController;
