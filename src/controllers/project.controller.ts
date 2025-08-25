import { NextFunction, Request, Response } from "express";
import ProjectService from "@/services/project.service";
import { Project } from "@/interfaces/project.interface";
import { CreateProjectDto, UpdateProjectDto } from "@/dtos/project.dto";

class ProjectController {
  public service = new ProjectService();

  public get = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const companyId = req.query.company_id as string;
      if (!companyId) {
        res.status(400).json({ message: "company_id query parameter is required" });
        return;
      }
      const data: any = await this.service.findAll(companyId);
      console.log(data)
      res.status(200).json({ data: data, message: "Projects retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

  public detail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id: string = req.params.id;
      const companyId = req.query.company_id as string;
      if (!companyId) {
        res.status(400).json({ message: "company_id query parameter is required" });
        return;
      }
      const data: Project = await this.service.findById(id, companyId);
      res.status(200).json({ data: data, message: "Project retrieved successfully" });
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
      const param: CreateProjectDto = req.body;
      const data: Project = await this.service.create(param);
      res.status(201).json({ data: data, message: "Project created successfully" });
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
      const param: UpdateProjectDto = req.body;
      const companyId = req.query.company_id as string;
      if (!companyId) {
        res.status(400).json({ message: "company_id query parameter is required" });
        return;
      }
      const data: Project = await this.service.update(id, param, companyId);
      res.status(200).json({ data: data, message: "Project updated successfully" });
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
      const id: string = req.params.id;
      const companyId = req.query.company_id as string;
      if (!companyId) {
        res.status(400).json({ message: "company_id query parameter is required" });
        return;
      }
      const data: Project = await this.service.delete(id, companyId);
      res.status(200).json({ data: data, message: "Project deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectController;