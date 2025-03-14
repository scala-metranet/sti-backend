import { NextFunction, Request, Response } from "express";
import { CreateRoleDto } from "@dtos/roles.dto";
import { Role } from "@interfaces/roles.interface";
import roleService from "@services/roles.service";

class RolesController {
	public roleService = new roleService();

	public getRoles = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Role[] = await this.roleService.findAll();

			//res.respondOk('Success to gel all roles', data);
			res.status(200).json({ data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

	// public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	//   try {
	//     const userId = Number(req.params.id);
	//     const findOneUserData: User = await this.userService.findUserById(userId);

	//     res.status(200).json({ data: findOneUserData, message: 'findOne' });
	//   } catch (error) {
	//     next(error);
	//   }
	// };

	public createRole = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const roleData: CreateRoleDto = req.body;
			const data: Role = await this.roleService.create(roleData);

			res.status(201).json({ data, message: "created" });
		} catch (error) {
			next(error);
		}
	};

	public updateRole = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const roleId = req.params.id;
			const roleData: Role = req.body;
			const updateRoleData: Role = await this.roleService.updateRole(
				roleId,
				roleData,
			);

			res.status(200).json({ data: updateRoleData, message: "updated" });
		} catch (error) {
			next(error);
		}
	};

	public deleteById = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const roleId = req.params.id;
			await this.roleService.deleteById(roleId);
			res.status(204).json({ message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default RolesController;
