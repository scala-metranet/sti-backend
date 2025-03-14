import { NextFunction, Request, Response } from "express";
import { Internship } from "@/interfaces/internship.interface";
import Internshipv2Service from "@/services/internshipv2.service";
import SupabaseProvider from "@/utils/supabase";

class Internshipv2Controller {
	public service = new Internshipv2Service();

	public get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const param:any = _req.query 
			const page = _req.query.page ? _req.query.page : 1;
				const perPage = _req.query.perPage ? _req.query.perPage : 5;

			const data: any = await this.service.get({
			...param,
			page:page,
			perPage: perPage
			});

			res.status(200).json({ data: data.results,
			pagination:{
				total: data.total,
						page: page,
						perPage: perPage,
			}, message: "Get data successfull." });
		} catch (error) {
			next(error);
		}
	};

	public detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id: string = req.params.id;
			const data: Internship = await this.service.detail(id);

			res.status(200).json({ data: data, message: "Get detail successfull." });
		} catch (error) {
			next(error);
		}
	};

	public getUserInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const param:any = req.query;
			const data: Internship = await this.service.getUserInterview(param);

			res.status(200).json({ data: data, message: "Get detail successfull." });
		} catch (error) {
			next(error);
		}
	};

	public getUserChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const param:any = req.query;
			const data: Internship = await this.service.getUserChallenge(param);

			res.status(200).json({ data: data, message: "Get detail successfull." });
		} catch (error) {
			next(error);
		}
	};

	public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id: string = req.params.id;
			const param: any = {...req.body,name:req.body.position};
			
			const data: Internship = await this.service.update(id,param);

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
			const param: any = {...req.body,name:req.body.position,mentor_id:req['user'].id};
			const data: Internship = await this.service.create(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public menteeRegisterList = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Internship = await this.service.menteeRegisterList(req['user'].id);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public menteeRegister = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: any = {...req.body,mentee_id:req['user'].id};
			const data: Internship = await this.service.menteeRegister(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public menteeInterview = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void| Response<unknown, Record<string, unknown>>> => {
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files){
				let files:any = Object.entries(req.files);
				for (let [key, value] of files) {
					const filepath = value.path;
					const contentType: string = value.mimetype;
					const { data, error }:any = await supabase.upload(
						key,
						filepath,
						contentType,
					);
					if (error) errors.push(error);
					else attachment[value.fieldname] = data.publicUrl;
				}
				if (errors.length) return res.status(400).send(errors);
			}
			
			let param ={...req.body,...attachment}
			const updateUserData:any = await this.service.createInterview(
				param,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public menteeChallenge = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void| Response<unknown, Record<string, unknown>>> => {
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files){
				let files:any = Object.entries(req.files);
				for (let [key, value] of files) {
					const filepath = value.path;
					const contentType: string = value.mimetype;
					const { data, error }:any = await supabase.upload(
						key,
						filepath,
						contentType,
					);
					if (error) errors.push(error);
					else attachment[value.fieldname] = data.publicUrl;
				}
				if (errors.length) return res.status(400).send(errors);
			}

			let param ={...req.body,...attachment}
			const updateUserData:any = await this.service.createChallenge(
				param,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public menteeDelete = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Internship = await this.service.deleteMentee(req.body.user_internship_id);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public duplicateInternship = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Internship = await this.service.duplicate(req.params.id,req.body);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};
}

export default Internshipv2Controller;
