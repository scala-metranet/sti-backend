import { NextFunction, Request, Response } from "express";
import BatchMasterService from "@/services/batch_master.service";

class BatchMasterController {
	public service = new BatchMasterService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data:any = await this.service.get({
        page:page,
        perPage: perPage,
        ..._req.query
      });

			res.status(200).json({ 
        data: data.results,
				pagination: {
					total: data.total,
					page: page,
					perPage: perPage,
				},
        message: "get data" });
		} catch (error) {
			next(error);
		}
	};

  public getFilter = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data:any = await this.service.getFilter({..._req.query});

			res.status(200).json({ 
        data: data,
        message: "get data" });
		} catch (error) {
			next(error);
		}
	};

  public detail = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data:any[] = await this.service.detail(_req.params.id);

			res.status(200).json({ data: data, message: "detail data" });
		} catch (error) {
			next(error);
		}
	};

	public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
      const data: any = await this.service.create({...req.body, user:req['user']});
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
			const param: any = req.body;
			const data: any = await this.service.update(id, param, req['user']);

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
			const deleteData:any = await this.service.delete(req.params.id);

			res.status(200).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};
}

export default BatchMasterController;
