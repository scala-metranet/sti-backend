import { NextFunction, Request, Response } from "express";
import { User } from "@interfaces/users.interface";
import userService from "@services/users.service";
import { RequestWithUser } from "@/interfaces/auth.interface";
import XLSX from "xlsx";
import SupabaseProvider from "@/utils/supabase";
import AttachmentService from "@/services/attachment.service";
class UsersController {
	public userService = new userService();
	public attachmentService = new AttachmentService();
	
	public getUsers = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const findAllUsersData: any = await this.userService.findAllUser({
				role: _req.query.role,
				search: _req.query.search,
				campus_id: _req.query.campus_id,
				company_id: _req.query.company_id,
				company_area_id: _req.query.company_area_id,
				company_unit_id: _req.query.company_unit_id,

				status: _req.query.status,
				campus_faculty_id: _req.query.campus_faculty_id,
				campus_major_id: _req.query.campus_major_id,
				degree: _req.query.degree,
				page: page,
				perPage: perPage,
			});

			res.status(200).json({
				data: findAllUsersData.results,
				pagination: {
					total: findAllUsersData.total,
					page: page,
					perPage: perPage,
				},
				message: "findAll",
			});
		} catch (error) {
			next(error);
		}
	};

	public getUsersByMentor = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any = await this.userService.findByMentor(_req['user'].id);

			res.status(200).json({
				data,message: 'Get Success'
			});
		} catch (error) {
			next(error);
		}
	};

	public getLetter = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId: string = req.params.id;
			const data: User = await this.attachmentService.generateLetter(userId);
			
			res.status(200).json({ data, message: "findOne" });
		} catch (error) {
			next(error);
		}
	};

	public getUserById = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId: string = req.params.id;
			const data: User = await this.userService.findUserById(userId);
			
			res.status(200).json({ data, message: "findOne" });
		} catch (error) {
			next(error);
		}
	};

	public getMenteeDetail = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userId: string = req.params.id;
			const data: User = await this.userService.detailMentee(userId);
			
			res.status(200).json({ data, message: "findOne" });
		} catch (error) {
			next(error);
		}
	};

	public createUser = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const userData:any = req.body;
			let supabase = new SupabaseProvider();
			let errors: unknown[] = [];
			//get major list if superadmin campus
			if(userData.role_id == 'Super Admin' && userData.internal == null){
				let files:any = req.files;
				let major_list = [];
				console.log(req.files)
				if(req.files.length){
					var workbook = XLSX.readFile(files[0].path);
					var sheet_name_list = workbook.SheetNames;
					let jsonData = XLSX.utils.sheet_to_json(
					  workbook.Sheets[sheet_name_list[0]]
					);
					if(jsonData.length){
						jsonData.map((e:any) => {
							major_list.push(e.Jurusan)
						})
					}
				}
				userData.major_list = major_list
			}

			if(userData.role_id == 'Mentee'){
				let files:any = req.files;
				let mahasiswa_list = [];
				let surat_rekomendasi = null;
				if(req.files){
					for (let index = 0; index < req.files.length; index++) {
						if(files[index].fieldname == 'excel_mahasiswa'){
							var workbook = XLSX.readFile(files[index].path);
							var sheet_name_list = workbook.SheetNames;
							let jsonData = XLSX.utils.sheet_to_json(
							  workbook.Sheets[sheet_name_list[0]]
							);
							if(jsonData.length){
								jsonData.map((e:any) => {
									mahasiswa_list.push({
										name: e.Nama,
										email: e['Email'].trim(),
										nik: e['No Induk Mahasiswa']?e['No Induk Mahasiswa']:e['No Induk Siswa'],
										no_hp: e['No HP'],
										degree: e['Degree']?e['Degree']:'D3',
										school: e["Jurusan"],
										semester: e["Semester"]?e['Semester']:e['Kelas']
									})
								})
							}
						}

						if(files[index].fieldname == 'surat_rekomendasi'){
							const filepath = files[index].path;
							const contentType: string = files[index].mimetype;
							const { data, error }:any = await supabase.upload(
								files[index],
								filepath,
								contentType,
							);
							if (error) errors.push(error);
							else surat_rekomendasi = data.publicUrl;
						}
					}
				}
				if(mahasiswa_list.length){
					userData.mahasiswa_list = mahasiswa_list
				}
				userData.surat_rekomendasi = surat_rekomendasi
			}
			let createUserData:User

			if(userData.mahasiswa_list){
				createUserData = await this.userService.importUser(userData);
			}else{
				createUserData = await this.userService.createUser(userData);
			}

			res.status(201).json({ data: createUserData, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public resendVerification = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param:any = {...req.body,id:req.params.id};
			const createUserData = await this.userService.resendVerification(param);

			res.status(201).json({ data: createUserData, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public updateUser = async (
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
			

			const userId = req.params.id;
			let param ={...req.body}
			if(attachment.photo){
				param.photo = attachment.photo
			}
			if(attachment.banner){
				param.banner = attachment.banner
			}
			const userData: User = param
			const updateUserData: User = await this.userService.updateUser(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public updateProfile = async (
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
			
			const userId = req.params.id;
			let param ={...req.body}
			if(attachment.photo){
				param.photo = attachment.photo
			}
			if(attachment.banner){
				param.banner = attachment.banner
			}
			const userData: User = param
			const updateUserData: User = await this.userService.updateUser(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public updateEducation = async (
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
			
			const userId = req.params.id;
			let param ={...req.body}
			if(attachment.photo){
				param.photo = attachment.photo
			}
			if(attachment.banner){
				param.banner = attachment.banner
			}
			const userData: User = param
			const updateUserData: User = await this.userService.updateUser(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public updateExperience = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void| Response<unknown, Record<string, unknown>>> => {
		try {
			const userId = req.params.id;
			let param ={...req.body}
			const userData: User = param
			const updateUserData: User = await this.userService.updateUserExperience(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public updateCertificate = async (
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
			
			const userId = req.params.id;
			let param ={...req.body,...attachment}
			const userData: User = param
			const updateUserData: User = await this.userService.updateCertificate(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public updateFile = async (
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
			
			const userId = req.params.id;
			let param ={...req.body,...attachment}
			const userData: User = param
			const updateUserData: User = await this.userService.updateFile(
				userId,
				userData,
			);

			res.status(200).json({ data: updateUserData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public deleteUser = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const deleteUserData: User = await this.userService.deleteUser(
				req.params.id,
			);

			res.status(200).json({ data: deleteUserData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
	public verifyUser = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			await this.userService.verifyUser(req.body.email);
			res.status(200).json({ message: "Success verify user" });
		} catch (error) {
			next(error);
		}
	};
}

export default UsersController;
