import { NextFunction, Request, Response } from "express";
import CompanyVisitService from "@/services/company_visit.service";
import SupabaseProvider from "@/utils/supabase";

class CompanyVisitController {
	public service = new CompanyVisitService();

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
        company_id: _req.query.company_id
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

  public detailMentee = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data:any = await this.service.detailPeserta(_req.params.id,{
        ..._req.query,
        page:page,
        perPage:perPage
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


  public createPresensi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
      const data: any = await this.service.createPresensi(req.body);
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

	public create = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void | Response<unknown, Record<string, unknown>>>=> {
		try {
			let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
			let poster:any = ""
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
				else poster = data.publicUrl;
			}
			if (errors.length) return res.status(400).send(errors);

      const data: any = await this.service.create({
        ...req.body,
        poster:poster
      });
      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

	public update = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void | Response<unknown, Record<string, unknown>>> => {
		try {
      let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
			let poster:any = ""
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
				else poster = data.publicUrl;
			}
			if (errors.length) return res.status(400).send(errors);

			const id: string = req.params.id;
			const param: any = poster == "" ? req.body: {...req.body,poster:poster};
			const data: any = await this.service.update(id, param);

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

export default CompanyVisitController;
