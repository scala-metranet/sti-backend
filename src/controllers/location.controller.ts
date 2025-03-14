import { NextFunction, Request, Response } from "express";
import LocationService from "@/services/location.service";

class LocationController {
	public service = new LocationService();

	public getProvince = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data:any[] = await this.service.findProvince();

			res.status(200).json({ data: data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

	public getCity = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any[] = await this.service.findCity(_req.query.province_id);

			res.status(200).json({ data: data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};
}

export default LocationController;
