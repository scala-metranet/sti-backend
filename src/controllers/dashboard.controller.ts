import { NextFunction, Request, Response } from "express";
import DashboardService from "@/services/dashboard.service";

class DashboardController {
	public service = new DashboardService();

  public getSummaryAdmin = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      console.log(_req['user'])
		const data:any = await this.service.getSummaryAdmin();

		res.status(200).json({ 
        		data: data,
        message: "count" });
		} catch (error) {
			next(error);
		}
	};

	public getSummary = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      console.log(_req['user'])
		const data:any = await this.service.countTask({
      user:_req['user']
    });

		res.status(200).json({ 
        		data: data,
        message: "count" });
		} catch (error) {
			next(error);
		}
	};

	public getLeaderboard = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data:any = await this.service.getLeaderboard({
          user:_req['user'],
          search: _req.query.search,
          page: page,
          perPage: perPage,
          month: _req.query.month,
          year: _req.query.year,
          internship_id: _req.query.internship_id,
          company_id: _req.query.company_id
      });

      res.status(200).json({ 
        data: data.results,
        pagination: {
          total: data.total,
          page: page,
          perPage: perPage,
        },
        message: "count" });
		} catch (error) {
			next(error);
		}
	};

  public getLeaderboardMentor = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data:any = await this.service.getLeaderboardMentor({
          user:_req['user'],
          search: _req.query.search,
          page: page,
          perPage: perPage,
          month: _req.query.month,
          year: _req.query.year,
          company_id: _req.query.company_id
      });

      res.status(200).json({ 
        data: data.results,
        pagination: {
          total: data.total,
          page: page,
          perPage: perPage,
        },
        message: "count" });
		} catch (error) {
			next(error);
		}
	};

	public getLeaderboardRekap = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
      const data:any = await this.service.getLeaderboardRekap({
          user:_req['user'],
		  user_id: _req['user'].id,
          search: _req.query.search,
          page: page,
          perPage: perPage,
          month: _req.query.month,
          year: _req.query.year,
          internship_id: _req.query.internship_id,
          company_id: _req.query.company_id
      });

      res.status(200).json({ 
        data: data.results,
        pagination: {
          total: data.total,
          page: page,
          perPage: perPage,
        },
        message: "count" });
		} catch (error) {
			next(error);
		}
	};
}

export default DashboardController;
