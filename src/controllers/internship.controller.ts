import { NextFunction, Request, Response } from "express";
import InternshipService from "@/services/internship.service";
import { Internship } from "@/interfaces/internship.interface";
import { InternshipProgramId } from "@/dtos/internship.dto";
import SupabaseProvider from "@/utils/supabase";

class InternshipController {
	public service = new InternshipService();

	public get = async (
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const data: Internship[] = await this.service.findAll(_req.query);

			res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
			next(error);
		}
	};

	public getByMitra = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const param:any = _req.query 
		  const page = _req.query.page ? _req.query.page : 1;
		const perPage = _req.query.perPage ? _req.query.perPage : 5;
	
		  const data: any = await this.service.findByMitra({
			...param,
			page:page,
			perPage: perPage
		  });
	
		  res.status(200).json({ data: data.results,
			pagination:{
			  total: data.total,
						page: page,
						perPage: perPage,
			}, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	};

	public getPublic = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const param:any = _req.query 
		  const page = _req.query.page ? _req.query.page : 1;
				const perPage = _req.query.perPage ? _req.query.perPage : 5;
	
		  const data: any = await this.service.findPublic({
			...param,
			page:page,
			perPage: perPage
		  });
	
		  res.status(200).json({ data: data.results,
			pagination:{
			  total: data.total,
						page: page,
						perPage: perPage,
			}, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	  };

  public getByMentor = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const param:any = _req.query 
      const page = _req.query.page ? _req.query.page : 1;
			const perPage = _req.query.perPage ? _req.query.perPage : 5;

      const data: any = await this.service.findByMentor(_req['user'].id,{
        ...param,
        page:page,
        perPage: perPage
      });

      res.status(200).json({ data: data.results,
        pagination:{
          total: data.total,
					page: page,
					perPage: perPage,
        }, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getRegistrant = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const param:any = _req.query 
      const page = _req.query.page ? _req.query.page : 1;
	    const perPage = _req.query.perPage ? _req.query.perPage : 5;

      const data: any = await this.service.findRegistrantByMentor(_req['user'].id,{
        ...param,
        page:page,
        perPage: perPage,
		role:_req['user'].role.name
      });

      res.status(200).json({ data: data.results,
        pagination:{
          total: data.total,
					page: page,
					perPage: perPage,
        }, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getRegistrantDetail = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: any = await this.service.getRegistrantDetail(_req.params.id);

      res.status(200).json({ data: data});
    } catch (error) {
      next(error);
    }
  };

  public downloadRegistrant = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const param:any = _req.query 
      const page = _req.query.page ? _req.query.page : 1;
		const perPage = 10000;

      const data: any = await this.service.findRegistrantByMentor(_req['user'].id,{
        ...param,
        page:page,
        perPage: perPage,
      });

	  const excel = require("exceljs");

		let workbook = new excel.Workbook();
		let worksheet = workbook.addWorksheet("Data");

		worksheet.columns = [
			{header:'Nama Mahasiswa',key:'mentee.name'},
			{header:'Jurusan',key:'mentee.school'},
			{header:'Posisi',key:'internship.position'},
		];

		worksheet.addRows(data.results)

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);

		res.setHeader(
			"Content-Disposition",
			"attachment; filename=" + `Data.xlsx`
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
    } catch (error) {
      next(error);
    }
  };

  public getRegistrantCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: any = await this.service.countRegistrantByMentor(_req['user'].id,
	  {
		internship_type:_req.query.internship_type,
		role:_req['user'].role.name
	});

      res.status(200).json({ data: data});
    } catch (error) {
      next(error);
    }
  };

  public createInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				user_internship_id: req.body.user_internship_id,
				schedule_id: req.body.schedule_id,
				schedule_session_id: req.body.schedule_session_id,
				interview_link: req.body.interview_link,
				interviewer_id: req['user'].id
			}
			const data: any = await this.service.createInterview(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public updateApplicant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				user_internship_id: req.body.user_internship_id,
				status: req.body.status,
			}
			const data: any = await this.service.updateApplicantStatus(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public updateApplicantInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				...req.body,
				user_internship_id:req.params.id
			}
			const data: any = await this.service.updateApplicantInterview(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public updateApplicantChallenge= async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				...req.body,
				user_internship_id:req.params.id
			}
			const data: any = await this.service.updateApplicantChallenge(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public resendNotif = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				user_internship_id: req.body.user_internship_id
			}
			const data: any = await this.service.resendNotif(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public bulkSendNotif = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				...req.body
			}
			const data: any = await this.service.bulkSendNotif(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public confirmMentee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				...req.body
			}
			const data: any = await this.service.confirmMentee(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public getRemapping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const data: any = await this.service.getRemapping(req.params.id);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public remapping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
			const param: any = {
				user_internship_id: req.body.user_internship_id,
        internship_id: req.body.internship_id,
				notes: req.body.notes,
        user_id: req['user'].id
			}
			const data: any = await this.service.remapping(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public updateApplicantMou = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
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
				status: req.body.status,
        attachment:attachment
			}
			const data: any = await this.service.updateApplicantStatusMou(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
  };

  public addAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void | Response<unknown, Record<string, unknown>>> => {
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

  public getLocation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
		const data: Internship[] = await this.service.findAllGroupByLocation();
		res.status(200).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: string = req.params.id;
      const data: Internship = await this.service.findById(id);

			res.status(200).json({ data: data, message: "Get detail successfull." });
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
			const param: any = {...req.body,name:req.body.position,mentor_id:req['user'].id,program_id: InternshipProgramId[req.body.intern_type]};
			delete param.intern_type
			const data: Internship = await this.service.create(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public assign = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: any = {
				campus_id: req.body.campus_id,
				internship_id: req.body.internship_id,
				quota:0
			}
			const data:any = await this.service.assign(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public unAssign = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: any = {
				campus_id: req.body.campus_id,
				internship_id: req.body.internship_id
			}
			const data:any = await this.service.unAssign(param);

			res.status(201).json({ data: data, message: "Data created." });
		} catch (error) {
			next(error);
		}
	};

	public updateQuota = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const param: any = {
				campus_id: req.body.campus_id,
				internship_id: req.body.internship_id,
				quota: req.body.quota
			}
			const data: any = await this.service.updateQuota(param);

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
			const param: Internship = req.body;
			const data: Internship = await this.service.update(id, param, req['user']);

			res.status(200).json({ data: data, message: "Data updated." });
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
			const deleteData: Internship = await this.service.delete(req.params.id, req['user']);

			res.status(200).json({ data: deleteData, message: "Data deleted." });
		} catch (error) {
			next(error);
		}
	};

	public filterInternship = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const param:any = _req.query
		  const data: any = await this.service.getFilterInternship({...param});
	
		  res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	};

	public filterCompany = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const data: any = await this.service.getFilterCompany();
	
		  res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	};

	public filterMentor = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const data: any = await this.service.getFilterMentor();
	
		  res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	};

	public filterMitra = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
		  const data: any = await this.service.getFilterMitra();
	
		  res.status(200).json({ data: data, message: "Get data successfull." });
		} catch (error) {
		  next(error);
		}
	};
}

export default InternshipController;
