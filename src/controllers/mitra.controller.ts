import { NextFunction, Request, Response } from "express";
import { Company } from "@/interfaces/company.interface";
import SupabaseProvider from "@/utils/supabase";
import MitraService from "@/services/mitra.service";

class MitraController {
	public service = new MitraService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			let param = _req.query;
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;

			const data:any = await this.service.findAll(
				{
					page:page,
					perPage: perPage,
					...param,
				}
			);

			res.status(200).json({ data: data.results,
				pagination:{
			  		total: data.total,
					page: page,
					perPage: perPage,
				}, 
			message: "Get data successfull." });
		} catch (error) {
			next(error);
		}
	};

	public companyFilter = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param:any = req.query;
			console.log(param)
			const data:any = await this.service.companyFilter();

			res.status(200).json({ data: data, message: "filter" });
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
			const param:any = req.query;
			const data:any = await this.service.findById(param);

			res.status(200).json({ data: data, message: "findOne" });
		} catch (error) {
			next(error);
		}
	};

	public create = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Response<unknown, Record<string, unknown>>> => {
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files != undefined && req.files != null){
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
			// console.log(attachment)
			const param:any = {...req.body,attachment};
			const data:any = await this.service.create(param);

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

	public updateDetail = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Response<unknown, Record<string, unknown>>> =>{
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files != undefined && req.files != null){
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
			// console.log(attachment)
			const param:any = {...req.body,attachment};
			const data:any = await this.service.updateDetail(req.params.id,param);

			res.status(201).json({ data: data, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public updatePic = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Response<unknown, Record<string, unknown>>> =>{
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files != undefined && req.files != null){
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
			// console.log(attachment)
			const param:any = {...req.body,attachment};
			const data:any = await this.service.updatePic(req.params.id,param);

			res.status(201).json({ data: data, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public updateProgram = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Response<unknown, Record<string, unknown>>> =>{
		try {
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			let attachment:any = {}
			if(req.files != undefined && req.files != null){
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
			// console.log(attachment)
			const param:any = {...req.body,attachment};
			const data:any = await this.service.updateProgram(req.params.id,param);

			res.status(201).json({ data: data, message: "created" });
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
			const deleteData:any = await this.service.delete(req.body);

			res.status(200).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default MitraController;
