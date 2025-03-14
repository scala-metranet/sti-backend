import { NextFunction, Request, Response } from "express";
import PermissionService from "@/services/permission.service";
import UserService from "@/services/users.service";
const availablePermission:any = [
	'presensi', 'e-learning', 'mitra', 'mitra-akademis', 'admin-management', 'internship', 'leaderboard', '360-feedback', 'contact'
];
class PermissionController {
	public service = new PermissionService();
	public userService = new UserService();
	
	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			//res.respondOk('Success to gel all roles', data);
			res.status(200).json({ data: availablePermission, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

	public getUser = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			let permission = availablePermission

			// const user:any = await this.userService.findUserById(_req.user.id)
			// const userPermission:any = await this.service.getUserPermission(_req.user.id)
			// console.log(userPermission)
			// if(userPermission.length && userPermission[0].permission.length){
			// 	permission = userPermission[0].permission
			// }else{
			// 	const rolePermission:any = await this.service.getRolePermission(_req.user.id)
			// 	if(rolePermission.length && rolePermission[0].permission.length){
			// 		permission = rolePermission[0].permission
			// 	}
			// }
			

			//res.respondOk('Success to gel all roles', data);
			
			res.status(200).json({ permission:permission, message: "findAll" });
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
			let param = null
			if(req.body.type == 'role'){
				param = {
					role_id: req.body.role_id,
					permission: req.body.permission
				}
				//check existing
				const existing:any = await this.service.getRolePermission(param.role_id)
				if(existing.length){
					await this.service.deletePermissionRole(param.role_id)
				}
			}else{
				param = {
					user_id: req.body.user_id,
					permission: req.body.permission
				}
				//check existing
				const existing:any = await this.service.getUserPermission(param.user_id)
				if(existing.length){
					await this.service.deletePermissionUser(param.user_id)
				}
			}
			const data: any = await this.service.create(param);

			res.status(201).json({ data, message: "created" });
		} catch (error) {
			next(error);
		}
	};
}

export default PermissionController;
