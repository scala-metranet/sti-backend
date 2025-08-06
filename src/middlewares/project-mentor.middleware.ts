import { NextFunction, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { RequestWithUser } from "@interfaces/auth.interface";
import { ModelProjectMentor } from "@/models/project_mentor.model";
import { RoleName } from "@/dtos/roles.dto";

const projectMentorGuardMiddleware = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
  try {
    const user = req["user"];
    const projectId = req.body.project_id || req.query.project_id || req.params.project_id;
    
    if (!projectId) {
      return next();
    }

    if (user?.role?.name === RoleName.super_admin) {
      return next();
    }

    const projectMentor = await ModelProjectMentor.query()
      .where('project_id', projectId)
      .where('mentor_id', user.id)
      .first();

    if (!projectMentor) {
      return next(new HttpException(403, "Only assigned mentors can perform this action on the project"));
    }

    next();
  } catch (error) {
    next(new HttpException(422, "Unknown entity"));
  }
};

export default projectMentorGuardMiddleware;