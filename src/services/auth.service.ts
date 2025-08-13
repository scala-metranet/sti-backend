import { hash, verify } from "argon2";
import { UserStatus } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import { Users } from "@models/users.model";
import { generateId } from "@utils/util";
import TokenService from "@services/token.service";
import UserService from "@services/users.service";
import { randomBytes } from "crypto";
import { Roles } from "@/models/roles.model";
import { ModelCampus } from "@/models/campus.model";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { join } from "path";
import { ModelLoginLogs } from "@/models/login_logs.model";
import moment from "moment";
import { ModelForgetToken } from "@/models/forget_token.model";
import { raw } from "objection";
import { ModelSpeaker } from "@/models/speaker.model";
import { ModelCompany } from "@/models/company.model";
import { ModelMeetSchedule } from "@/models/meet_schedule.model";
import OtpService from "./otp.service";
import { ModelOtpVerification } from "@/models/otp_verification.model";

class AuthService {
	private tokenService: TokenService = new TokenService();
	private userService: UserService = new UserService();
	private otpService: OtpService = new OtpService();

	public async register(userData: any): Promise<User> {
		const findUser: User = await this.userService.findByEmail(userData.email);
		if (findUser) throw new HttpException(409, "This email already exists.");
		
		const originRole = userData.role_id;

		if (userData.role_id == 'Mitra Perusahaan' || userData.role_id == 'Mitra Akademik'){
			userData.role_id = 'Super Admin';
		}
		if (userData.role_id == 'Speaker'){
			userData.role_id = 'Mentor';
		}

		const findRole: Roles = await Roles.query()
			.select()
			.from(Roles.tableName)
			.where("name", "=", userData.role_id)
			.first();

		const schedule_id = generateId();
		// create speaker
		if (originRole == 'Speaker'){
			const newSpeaker:any = await ModelSpeaker.query()
				.insert({
					id: generateId(),
					user_id:null,
					expertise: userData.expertise,
					experience: userData.experience,
					reason: userData.reason
				})
				.into(ModelSpeaker.tableName)
			userData.speaker_id = newSpeaker.id 
			delete userData.expertise 
			delete userData.experience
			delete userData.reason
		}

		if (originRole == 'Mitra Perusahaan'){
			const newCompany:any = await ModelCompany.query()
				.insert({
					id: generateId(),
					name:userData.company['name'],
					address:userData.company['address'],
					logo:userData.photo,
					website:userData.company['website'],
					cfu:'-',
					department:'-',
					unit:'-',
					description:'-',
					type:'-',
				})
				.into(ModelCompany.tableName)
			userData.company_id = newCompany.id 
			delete userData.company 
			const newSchedule:any = await ModelMeetSchedule.query()
				.insert({
					id: schedule_id,
					user_id:null,
					date:userData.meet_schedule['date'],
					start_hour:userData.meet_schedule['start_hour'],
					end_hour:userData.meet_schedule['end_hour'],
					information:userData.meet_schedule['information'],
				})
				.into(ModelMeetSchedule.tableName)
			console.log(newSchedule)
			delete userData.meet_schedule 
		}

		if (originRole == 'Mitra Akademik'){
			const newCampus:any = await ModelCampus.query()
				.insert({
					id: generateId(),
					name:userData.campus['name'],
					address:userData.campus['address'],
					email:userData.email,
					phone:userData.no_hp,
					website:userData.campus['website'],
					pic:userData.name,
					pic_position:userData.position
				})
				.into(ModelCampus.tableName)
			userData.campus_id = newCampus.id 
			delete userData.campus 
			const newSchedule:any = await ModelMeetSchedule.query()
				.insert({
					id: schedule_id,
					user_id:null,
					date:userData.meet_schedule['date'],
					start_hour:userData.meet_schedule['start_hour'],
					end_hour:userData.meet_schedule['end_hour'],
					information:userData.meet_schedule['information'],
				})
				.into(ModelMeetSchedule.tableName)
			console.log(newSchedule)
			delete userData.meet_schedule 
		}

		const newUser: User = await Users.query()
			.insert({
				...userData,
				id: generateId(),
				role_id: findRole.id,
				password: await hash(userData.password),
				status: UserStatus.active, 
				campus_id: userData.campus_id,
				nik: userData.nik
			})
			.into(Users.tableName);
		
		if (originRole == 'Speaker'){
			const updateSpeaker:any = await ModelSpeaker.query()
				.where('id',userData.speaker_id)
				.update({
					user_id: newUser.id
				})
			console.log(updateSpeaker)
		}
		
		if (originRole == 'Mitra Perusahaan' || originRole == 'Mitra Akademik'){
			const updateSchedule:any = await ModelMeetSchedule.query()
			.where('id',schedule_id)
			.update({
				user_id: newUser.id
			})
			console.log(updateSchedule)
		}

		// OTP sending commented out to remove verification requirement
		// await this.otpService.sendOtp({
		// 	user_id: newUser.id,
		// 	email: newUser.email,
		// 	name: newUser.name,
		// })

		//token on register
		const accessKey = randomBytes(16).toString("hex");
		const refreshKey = randomBytes(16).toString("hex");
		// rome-ignore lint/performance/noDelete: <explanation>
		await this.tokenService.saveToken(newUser.id, accessKey, refreshKey);
		const tokens = await this.tokenService.generateTokens(
			newUser,
			accessKey,
			refreshKey,
		);
		console.log(tokens)
		// remove old token when login
		await this.tokenService.removeOldToken();

		return { ...userData, id: newUser.id, token: tokens };
	}

	public async verifOtp(param: any): Promise<any> {
		console.log(param)
		const findUser:any = await Users.query()
			.select()
			.from(Users.tableName)
			.where("id", "=", param.id)
			.whereNotDeleted()
			.first();
		if (!findUser) throw new HttpException(409, "Unauthenticated");

		const checkOtp: any = await ModelOtpVerification.query()
			.where('otp_code',param.otp_code)
			.where('user_id',param.id)
			.where('expired','>=', moment().format('YYYY-MM-DD HH:mm'))
			.whereNotDeleted()
			.first();
		if (!checkOtp) throw new HttpException(409, "Otp invalid!");
		
		const deleteOtp: any = await ModelOtpVerification.query()
			.where('otp_code',param.otp_code)
			.where('user_id',param.id)
			.where('expired','>=', moment().format('YYYY-MM-DD HH:mm'))
			.whereNotDeleted()
			.delete();
		if (!deleteOtp) throw new HttpException(409, "Delete OTP failed!");
		
		const updateUser:any = await Users.query()
		.where('id',param.id)
		.update({
			status: 'active'
		})
		if (!updateUser) throw new HttpException(409, "Fail update!");

		return findUser;
	}

	public async resendOtp(param: any): Promise<any> {
		const findUser:any = await Users.query()
			.select()
			.from(Users.tableName)
			.where("id", "=", param.id)
			.whereNotDeleted()
			.first();
		if (!findUser) throw new HttpException(409, "Unauthenticated");

		await this.otpService.sendOtp({
			user_id: findUser.id,
			email: findUser.email,
			name: findUser.name
		})

		return findUser;
	}

	public async verification(userData: any,attachment:any): Promise<any> {
		const findUser: User[] = await Users.query()
			.select()
			.from(Users.tableName)
			.where("id", "=", userData.id)
			.whereNotDeleted();
		if (!findUser) throw new HttpException(409, "User doesn't exist");

		userData.password = await hash(userData.password);
		const paramUser = {
			name: userData.name,
			password:userData.password,
			no_hp:userData.phone,
			status:UserStatus.active,
			photo: attachment.photo?attachment.photo:'',
			banner: attachment.banner?attachment.banner:'',
			nik: userData.nik,
			place_of_birth: userData.place_of_birth,
			date_of_birth: userData.date_of_birth,
			soft_skill: userData.soft_skill?userData.soft_skill.split(','):[],
			hard_skill: userData.hard_skill?userData.hard_skill.split(','):[],
			instagram: userData.instagram,
			linkedin: userData.linkedin,
		}

		await Users.query()
			.update({ ...paramUser })
			.where("id", "=", userData.id)
			.into("user");

		const user: User = await this.userService.findByEmail(userData.email);
		// if campus 
		if(userData.role === 'Super Admin' && userData.campus_id){
			//update campus data
			const updateCampus = await ModelCampus.query().update({
				name:userData.campus?.name,
				address:userData.address
				,phone:userData.phone,
				pic: userData.pic,
				pic_position:userData.pic_position})
			.where('id','=',userData.campus_id)
			.into('campus')
			if(!updateCampus) throw new HttpException(409, "Fail update data");
		} 

		// if mentee 
		if(userData.role === 'Mentee'){
			//get user internship of mentee
			const userInternship = await ModelUserInternship.query().where('mentee_id','=',userData.id).first()
			if(!userInternship) throw new HttpException(409, "Fail update data");

			const berkas = ['curriculum_vitae','transkrip_nilai','jadwal_kuliah','surat_keterangan_aktif_kuliah','personality_test','bpjs']
			for (let index = 0; index < berkas.length; index++) {
				const e = berkas[index]
				if(attachment[e]){
					const insertBerkas:any = await ModelUserInternshipDocument.query().insert({
						id:generateId(),
						user_internship_id:userInternship.id,
						key:e,
						value:attachment[e]
					}).into(ModelUserInternshipDocument.tableName)
					if(!insertBerkas) throw new HttpException(409, "Fail update data");
				}
			}
		} 

		const accessKey = randomBytes(16).toString("hex");
		const refreshKey = randomBytes(16).toString("hex");
		
		delete user.password;
		await this.tokenService.saveToken(user.id, accessKey, refreshKey);
		const tokens = this.tokenService.generateTokens(
			user,
			accessKey,
			refreshKey,
		);

		// remove old token when login
		await this.tokenService.removeOldToken();

		const emailProvider = new NodeMailerProvier();
        const fs = require("fs");
        const handlebars = require("handlebars");
        let pathview = join(process.cwd(), "/src/views/notifikasi-verifikasi.html");
        const source = fs.readFileSync(pathview, "utf-8").toString();
        const template = handlebars.compile(source);
        const replacements = {
          name: user.name,
          email: user.email,
        };
  
        emailProvider.send({
          email: user.email,
          subject: `Akun Terverifikasi`,
          content: template(replacements),
        });
		return tokens;
	}

	public async login(
		userData: any,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const findUser: any = await this.userService.findByEmail(userData.email);
		if (!findUser){
			const insertLog:any = await ModelLoginLogs.query().insert({
				id:generateId(),
				user_id:null,
				ip:userData.ip,
				status:'failed'
			}).into(ModelLoginLogs.tableName)
			if(!insertLog) throw new HttpException(409, "Fail update data"); 
		 	
			throw new HttpException(409, "Invalid email / password.");
		}

		const isPasswordMatching: boolean = await verify(
			findUser.password,
			userData.password,
		);
		if (!isPasswordMatching){
			const insertLog:any = await ModelLoginLogs.query().insert({
				id:generateId(),
				user_id:findUser.id,
				ip:userData.ip,
				status:'failed'
			}).into(ModelLoginLogs.tableName)
			if(!insertLog) throw new HttpException(409, "Fail update data"); 

			throw new HttpException(409, "Invalid email / password.");
		}

		// Commented out unverified status check to allow unverified users to login
		// if (findUser["status"] === "unverified") {
		// 	const insertLog:any = await ModelLoginLogs.query().insert({
		// 		id:generateId(),
		// 		user_id:findUser.id,
		// 		ip:userData.ip,
		// 		status:'failed'
		// 	}).into(ModelLoginLogs.tableName)
		// 	if(!insertLog) throw new HttpException(409, "Fail update data"); 
		// 
		// 	throw new HttpException(409, "Account not verified.");
		// }

		//OTP is valid for 1 week - DISABLED
		// let isNeedOtp:any = await ModelOtpVerification.query()
		// .where('user_id',findUser.id)
		// .whereDeleted()
		// .orderBy('id','desc')
		// .first();
		// if (isNeedOtp) {
		// 	const days = moment(isNeedOtp.created_at).add('7','days')
		// 	const now = moment()
		// 	const diff = days.diff(now,'day')
		// 	if(diff < 1){
		// 		isNeedOtp = true
		// 	}else{
		// 		isNeedOtp = false
		// 	}
		// }

		// if(findUser.role == 'Super Admin'){
		// 	isNeedOtp = false
		// }
		
		// Disable OTP requirement for all users
		let isNeedOtp = false;
		
		if(isNeedOtp){
			if(!userData.otp_code)
			throw new HttpException(409, "Need OTP!");

			const checkOtp: any = await ModelOtpVerification.query()
			.where('otp_code',userData.otp_code)
			.where('user_id',findUser.id)
			.where('expired','>=', moment().format('YYYY-MM-DD HH:mm'))
			.whereNotDeleted()
			.first();
			if (!checkOtp) {
				const insertLog:any = await ModelLoginLogs.query().insert({
					id:generateId(),
					user_id:findUser.id,
					ip:userData.ip,
					status:'failed'
				}).into(ModelLoginLogs.tableName)
				if(!insertLog) throw new HttpException(409, "Fail update data"); 

				throw new HttpException(409, "Otp invalid!");
			}
			const deleteOtp: any = await ModelOtpVerification.query()
			.where('otp_code',userData.otp_code)
			.where('user_id',findUser.id)
			.where('expired','>=', moment().format('YYYY-MM-DD HH:mm'))
			.whereNotDeleted()
			.delete();
			if (!deleteOtp) throw new HttpException(409, "Delete OTP failed!");
		}

		const insertLog:any = await ModelLoginLogs.query().insert({
			id:generateId(),
			user_id:findUser.id,
			ip:userData.ip,
			status:'success'
		}).into(ModelLoginLogs.tableName)
		if(!insertLog) throw new HttpException(409, "Fail update data"); 

		const accessKey = randomBytes(16).toString("hex");
		const refreshKey = randomBytes(16).toString("hex");
		// rome-ignore lint/performance/noDelete: <explanation>
		delete findUser.password;
		await this.tokenService.saveToken(findUser.id, accessKey, refreshKey);
		const tokens = this.tokenService.generateTokens(
			findUser,
			accessKey,
			refreshKey,
		);
		// remove old token when login
		await this.tokenService.removeOldToken();
		return tokens;
	}

	public async impersonate(
		userData: any,
	): Promise<{ accessToken: string; refreshToken: string }> {
		console.log('impersonate',userData)
		if(!userData.reason){
			throw new HttpException(409, "Reason is required!");
		}
		const findUser: User = await this.userService.findByEmail(userData.email);
		if (!findUser){
			const insertLog:any = await ModelLoginLogs.query().insert({
				id:generateId(),
				user_id:null,
				ip:userData.ip,
				status:'failed',
				impersonate_by: userData.user_id,
				impersonate_reason: userData.reason
			}).into(ModelLoginLogs.tableName)
			if(!insertLog) throw new HttpException(409, "Fail update data"); 
		 	
			throw new HttpException(409, "Invalid email / password.");
		}

		if (findUser["status"] === "unverified") {
			const insertLog:any = await ModelLoginLogs.query().insert({
				id:generateId(),
				user_id:findUser.id,
				ip:userData.ip,
				status:'failed',
				impersonate_by: userData.user_id,
				impersonate_reason: userData.reason
			}).into(ModelLoginLogs.tableName)
			if(!insertLog) throw new HttpException(409, "Fail update data"); 

			throw new HttpException(409, "Account not verified.");
		}

		const insertLog:any = await ModelLoginLogs.query().insert({
			id:generateId(),
			user_id:findUser.id,
			ip:userData.ip,
			status:'success',
			impersonate_by: userData.user_id,
			impersonate_reason: userData.reason
		}).into(ModelLoginLogs.tableName)
		if(!insertLog) throw new HttpException(409, "Fail update data"); 

		const accessKey = randomBytes(16).toString("hex");
		const refreshKey = randomBytes(16).toString("hex");
		// rome-ignore lint/performance/noDelete: <explanation>
		delete findUser.password;
		await this.tokenService.saveToken(findUser.id, accessKey, refreshKey);
		const tokens = await this.tokenService.generateTokens(
			findUser,
			accessKey,
			refreshKey,
		);
		// remove old token when login
		await this.tokenService.removeOldToken();
		return tokens;
	}

	public async logout(userData: User): Promise<void> {
		// remove old token when logout
		await this.tokenService.removeOldToken();
		await this.tokenService.removeByUserId(userData.id);
	}

	public async forgetPassword(userData: any): Promise<any> {
		let user: any = await Users.query()
		.whereRaw(`BTRIM(LOWER(email)) = '${userData.email.trim().toLowerCase()}'`)
		.withGraphFetched("[role,campus]").first();

		if(user){
			user = {
				id: user.id,
				nik: user.nik,
				name: user.name,
				email: user.email,
				role: user.role.name,
				no_hp: user.no_hp,
				status: user.status,
				type: user.campus ? user.campus.type : "",
			};
			const token = Buffer.from(JSON.stringify(user)).toString("base64");
			//email
			const emailProvider = new NodeMailerProvier();
			const fs = require("fs");
			const handlebars = require("handlebars");
			let pathview = join(process.cwd(), "/src/views/forget-user.html");
			const source = fs.readFileSync(pathview, "utf-8").toString();
			const template = handlebars.compile(source);
			//add valid date to token
			const valid_date = moment().add(15,'minutes').format('YYYY-MM-DD HH:mm');
			//add token to forget_token
			//clear all token to used
			const updateToken = await ModelForgetToken.query().where('email',userData.email).update({
				is_used: true
			})
			console.log(updateToken)
			//add token to db
			const insertToken = await ModelForgetToken.query().insert({
				id: generateId(),
				email:userData.email,
				token:token,
				valid_date: valid_date
			})
			if (!insertToken) return {message:'ok'};

			const replacements = {
			  link: userData.linkVerification + "?token=" + token ,
			  name: user.name,
			  email: user.email,
			};
		
			emailProvider.send({
			  email: user.email,
			  subject: "Forget Password",
			  content: template(replacements),
			});
		}
		
		return {message:'ok'};
	}

	public async checkForgetToken(param:any): Promise<any> {
		const check = await ModelForgetToken
		.query()
		.where('token',param.token)
		.where('is_used',false)
		.where(raw('valid_date >= now()'))
		.first();
		if(!check) throw new HttpException(404, "Invalid Token!");

		return {message:'ok'};
	}

	public async updatePassword(userData: any): Promise<any> {
		const checkPassword = await this.userService.checkPassword(userData.password);
		if (!checkPassword) throw new HttpException(404, "Password anda tidak memenuhi kriteria, perhatikan saran dibawah!");
		
		const checkToken = await this.checkForgetToken({token: userData.id});
		console.log(checkToken);

		//check id
		let buff = new Buffer(userData.id, 'base64');
		let text = buff.toString('ascii');
		let id = JSON.parse(text).id

		let user: any = await Users.query().where("id", id).withGraphFetched("[role,campus]").first();
		if (!user) throw new HttpException(404, "Invalid token");
		const hashedPassword = await hash(userData.password)

		const updateUser: any = await Users.query().where("id", id).update({password:hashedPassword}).first();
		if (!updateUser) throw new HttpException(404, "Update password failed!");

		const updateToken = await ModelForgetToken.query().where('token',userData.id).update({
			is_used: true
		})
		if (!updateToken) throw new HttpException(404, "Update token failed!");

		const emailProvider = new NodeMailerProvier();
        const fs = require("fs");
        const handlebars = require("handlebars");
        let pathview = join(process.cwd(), "/src/views/notifikasi-password.html");
        const source = fs.readFileSync(pathview, "utf-8").toString();
        const template = handlebars.compile(source);
        const replacements = {
          name: user.name,
          email: user.email,
        };
  
        emailProvider.send({
          email: user.email,
          subject: `Update Password Akun`,
          content: template(replacements),
        });

		return {message:'ok'};
	}
	
	public async sendOtp(param: any): Promise<any> {
		const findUser: User = await this.userService.findByEmail(param.email);
		if (!findUser) throw new HttpException(409, "Unauthenticated");

		await this.otpService.sendOtp({
			user_id: findUser.id,
			email: findUser.email,
			name: findUser.name
		})

		return findUser;
	}

	// public createToken(user: User): TokenData {
	//   const dataStoredInToken: DataStoredInToken = { id: user.id };
	//   const secretKey: string = SECRET_KEY;
	//   const expiresIn: number = 60 * 60;

	// return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
	//}

	// public createCookie(tokenData: TokenData): string {
	//   return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
	// }
}

export default AuthService;
