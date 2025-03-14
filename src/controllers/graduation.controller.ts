import { NextFunction, Request, Response } from "express";
import SupabaseProvider from "@/utils/supabase";
import GraduationService from "@/services/graduation.service";

class GraduationController {
	public service = new GraduationService();

	public getGraduation = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data: any = await this.service.getGraduation({
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

	public getCountGraduation = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any = await this.service.getCountGraduation()

			res.status(200).json({ 
				data: data
			})
		} catch (error) {
			next(error);
		}
	};

	public getCurrentGraduation = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any = await this.service.getCurrentGraduation({
				..._req['user']
			});

			res.status(200).json({ 
				data: data,
			})
		} catch (error) {
			next(error);
		}
	};

  public getGraduationEvent = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;
			const data: any = await this.service.getGraduationEvent({
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

	public getCurrentGraduationEvent = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: any = await this.service.getCurrentGraduationEvent({
				..._req['user']
			});

			res.status(200).json({ 
				data: data,
			})
		} catch (error) {
			next(error);
		}
	};

  public createGraduation = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
		try {
		  let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
      let report_url:any = null
		  if(req.files){
        let files:any = Object.entries(req.files);
        for (let [key, value] of files) {
          if(value.fieldname === 'report_url'){
            const filepath = value.path;
            const contentType: string = value.mimetype;
            const { data, error }:any = await supabase.upload(
            key,
            filepath,
            contentType,
            );
            if (error) errors.push(error);
            else report_url = data.publicUrl;
          }
        }
        if (errors.length) return res.status(400).send(errors);
		  }
      if(report_url == null){
        res.status(400).send({ message: 'Report is required!'});
      }
	
      const param: any = {
        ...req.body,
        report_url:report_url
      }
      const data: any = await this.service.createGraduation(param);

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

	public createGraduationEvent = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
		try {
		  let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
      let poster:any = null
		  if(req.files){
        let files:any = Object.entries(req.files);
        for (let [key, value] of files) {
          if(value.fieldname === 'poster'){
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
        }
        if (errors.length) return res.status(400).send(errors);
		  }
      if(poster == null){
        res.status(400).send({ message: 'Poster is required!'});
      }
	
      const param: any = {
        ...req.body,
        poster:poster
      }
      const data: any = await this.service.createGraduationEvent(param);

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
			const id: string = req.params.id;
			const param: any = {...req.body,updated_by:req['user'].id};
      let certificate:any = null
      let raport:any = null
      if(param.status === 'accepted'){
        let files:any = Object.entries(req.files);
        let supabase = new SupabaseProvider();
        let errors: unknown[] = [];
        if(req.files){
          for (let [key, value] of files) {
            if(value.fieldname === 'certificate'){
              const filepath = value.path;
              const contentType: string = value.mimetype;
              const { data, error }:any = await supabase.upload(
              key,
              filepath,
              contentType,
              );
              if (error) errors.push(error);
              else certificate = data.publicUrl;
            }
            if(value.fieldname === 'raport'){
              const filepath = value.path;
              const contentType: string = value.mimetype;
              const { data, error }:any = await supabase.upload(
              key,
              filepath,
              contentType,
              );
              if (error) errors.push(error);
              else raport = data.publicUrl;
            }
          }
          if (errors.length) return res.status(400).send(errors);
        }
        if(certificate == null){
          res.status(400).send({ message: 'certificate is required!'});
        }
        if(raport == null){
          res.status(400).send({ message: 'raport is required!'});
        }
      }
			const data: any = await this.service.update(id, {...param,certificate:certificate,raport:raport});

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
}

export default GraduationController;
