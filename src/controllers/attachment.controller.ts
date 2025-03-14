import { NextFunction, Request, Response } from "express";
import { Campus } from "@/interfaces/campus.interface";
import AttachmentService from "@/services/attachment.service";
import SupabaseProvider from "@/utils/supabase";

class AttachmentController {
	public service = new AttachmentService();

	public getTemplate = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data: any = await this.service.getTemplate({..._req.query,
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

  public createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
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
	
      const param: any = {
        user_id: req['user'].id,
        attachment:attachment
      }
      const data: any = await this.service.createTemplate(param);

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

	public create = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
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
	
      const param: any = {
        user_internship_id: req.body.user_internship_id,
        attachment:attachment
      }
      const data: any = await this.service.createAttachment(param);

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
			const param: Campus = req.body;
			const data: Campus = await this.service.update(id, param);

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

			res.status(204).json({ data: deleteData, message: "deleted" });
		} catch (error) {
			next(error);
		}
	};

  public getMentee = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data:any = await this.service.getMentee(_req.query);

			res.status(200).json({ data: data, message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

  public createMentee = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
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
	
      const param: any = {
        user_internship_id: req.body.user_internship_id,
        attachment:attachment
      }
      const data: any = await this.service.createAttachment(param);

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public getMonitoring = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data:any = await this.service.getMonitoring({..._req.query,
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
        message: "findAll" });
		} catch (error) {
			next(error);
		}
	};

public countMonitoring = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
		const data:any = await this.service.countMonitoring();

		res.status(200).json({ 
        		data: data,
        message: "count" });
		} catch (error) {
			next(error);
		}
	};

  public updateMonitoring = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data:any = await this.service.updateMonitoring(req.body);

			res.status(200).json({ data: data, message: "updated" });
		} catch (error) {
			next(error);
		}
	};
}

export default AttachmentController;
