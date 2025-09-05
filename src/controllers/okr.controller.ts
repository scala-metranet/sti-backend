import { NextFunction, Request, Response } from "express";
import { Squad } from "@/interfaces/squad.interface";
import OkrService from "@/services/okr.service";
import { Sprint } from "@/interfaces/sprint.interface";
import { OkrTask } from "@/interfaces/okr_task.interface";
import SupabaseProvider from "@/utils/supabase";

class OkrController {
  public service = new OkrService();

  public get = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Squad[] = await this.service.findAll();

      res.status(200).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getByMentor = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Squad[] = await this.service.findByMentor(_req["user"].id);

      res.status(200).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getBySquad = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any = await this.service.findBySquad(_req.params.id);

      res.status(200).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public detail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id: string = req.params.id;
      const user = req["user"];
      const data: Sprint = await this.service.findById(id, user.company_id);

      const transformed = {
        ...data,
        squad_leader: data.squad_leader?.name || null,
      };

      res
        .status(200)
        .json({ data: transformed, message: "Get detail successfull." });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: Sprint = await this.service.create({
        ...param,
        mentor_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public getSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Sprint = await this.service.getSprint(req.params.id);

      res.status(200).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getSprintActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any = await this.service.getSprintActivity(req.params.id);

      res.status(201).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public getSprintAssign = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Sprint = await this.service.getSprintAssign(req.params.id);

      res.status(201).json({ data: data, message: "Get data successfull." });
    } catch (error) {
      next(error);
    }
  };

  public createSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: Sprint = await this.service.createSprint({
        ...param,
        user_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public createSprintKr = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: Sprint = await this.service.createSprintKr({
        ...param,
        user_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public updateSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: Sprint = await this.service.updateSprint({
        ...param,
        id: req.params.id,
        user_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public deleteSprint = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: Sprint = await this.service.deleteSprint({
        id: req.params.id,
        user_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data deleted." });
    } catch (error) {
      next(error);
    }
  };

  public getSprintsByProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const project_id: string = req.params.project_id;
      const user = req["user"];
      const data: Sprint[] = await this.service.getSprintsByProject(
        project_id,
        user.company_id
      );

      res
        .status(200)
        .json({ data: data, message: "Get sprints by project successful." });
    } catch (error) {
      next(error);
    }
  };

  public getTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.query;
      const user = req["user"];

      // If mentee_id matches current user or no mentee_id provided, use regular method
      // Otherwise, use user-filtered method to ensure access control
      let data: OkrTask[];
      if (param.mentee_id && param.mentee_id !== user.id) {
        data = await this.service.getTaskByUser({ ...param }, user.id);
      } else {
        data = await this.service.getTask({ ...param });
      }

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: OkrTask[] = await this.service.createTask({
        ...param,
        mentee_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = req.body;
      const data: OkrTask = await this.service.updateTask({
        ...param,
        user_id: req["user"].id,
      });

      res.status(201).json({ data: data, message: "Data created." });
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: any = await this.service.deleteTask(req.params.id);

      res.status(200).json({ data: data, message: "Data deleted." });
    } catch (error) {
      next(error);
    }
  };

  public uploadTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<unknown, Record<string, unknown>>> => {
    try {
      let supabase = new SupabaseProvider();
      let errors: unknown[] = [];
      let responseData: unknown[] = [];
      let files = Object.entries(req.files);
      for (let [key, value] of files) {
        value = value[0];
        const filepath = value.path;
        const contentType: string = value.mimetype;
        const { data, error } = await supabase.upload(
          key,
          filepath,
          contentType
        );
        if (error) errors.push(error);
        else responseData.push(data);
      }
      if (errors.length) return res.status(400).send(errors);
      const param: any = req.body;
      if (responseData.length) {
        param.attachment = responseData[0]["publicUrl"];
      }
      const data: any = await this.service.updateResult({
        ...param,
        mentee_id: req["user"].id,
      });
      return res.status(200).json({ data: data, message: "Data updated." });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id: string = req.params.id;
      const param: any = req.body;
      const data: any = await this.service.update(id, param);

      res.status(200).json({ data: data, message: "Data updated." });
    } catch (error) {
      next(error);
    }
  };

  public inputOkr = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const param: any = { ...req.body };
      const data: any = await this.service.inputOkr(param, req["user"]);

      res.status(200).json({ data: data, message: "Data updated." });
    } catch (error) {
      next(error);
    }
  };

  public updateOkr = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id: string = req.params.id;
      const param: any = req.body;
      const data: any = await this.service.updateOkr(id, param);

      res.status(200).json({ data: data, message: "Data updated." });
    } catch (error) {
      next(error);
    }
  };

  public deleteOkr = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleteData: any = await this.service.deleteOkr(req.params.id);

      res.status(200).json({ data: deleteData, message: "Data deleted." });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deleteData: Sprint = await this.service.delete(req.params.id);

      res.status(200).json({ data: deleteData, message: "Data deleted." });
    } catch (error) {
      next(error);
    }
  };
}

export default OkrController;
