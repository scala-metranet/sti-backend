import { NextFunction, Request, Response } from "express";
import SupabaseProvider from "@/utils/supabase";
import AttendanceService from "@/services/attendance.service";

class AttendanceController {
	public service = new AttendanceService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data: any = await this.service.get({
          ..._req.query,
          user: _req['user'],
				  page: page,
					perPage: perPage
			  });

			res.status(200).json({ 
				data: data.results,
				pagination: {
					total: data.total,
					page: page,
					perPage: perPage,
				},
			})
		} catch (error) {
			next(error);
		}
	};

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
		try {
		  let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
      let photo:any = null
		  if(req.files){
        let files:any = Object.entries(req.files);
        for (let [key, value] of files) {
          if(value.fieldname === 'photo'){
            const filepath = value.path;
            const contentType: string = value.mimetype;
            const { data, error }:any = await supabase.upload(
            key,
            filepath,
            contentType,
            );
            if (error) errors.push(error);
            else photo = data.publicUrl;
          }
        }
        if (errors.length) return res.status(400).send(errors);
		  }
      if(photo == null){
        res.status(400).send({ message: 'Photo is required!'});
      }
	
      const param: any = {
        ...req.body,
        photo:photo,
        user: req['user']
      }
      const data: any = await this.service.create(param);

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

	public getCurrent = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      console.log(_req['user'])
			const data: any = await this.service.getCurrent({
				..._req['user']
			});

			res.status(200).json({ 
				data: data,
			})
		} catch (error) {
			next(error);
		}
	};
}

export default AttendanceController;
