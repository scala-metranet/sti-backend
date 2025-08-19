import { NextFunction, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { RequestWithUser } from "@interfaces/auth.interface";
import { ModelOkrMentee } from "@/models/okr_mentee.model";
import { ModelOkrTaskMentee } from "@/models/okr_task_mentee.model";
import { ModelOkr } from "@/models/okr.model";
import { ModelSprint } from "@/models/sprint.model";
import { ModelOkrTask } from "@/models/okr_task.model";
import { RoleName } from "@/dtos/roles.dto";

const okrAssignmentGuardMiddleware = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const okrId = req.params.id || req.body.okr_id || req.query.okr_id;
    const sprintId = req.params.id || req.body.sprint_id || req.query.sprint_id;
    const taskId = req.params.id || req.body.task_id || req.query.task_id;
    
    if (!user) {
      return next(new HttpException(401, "User not authenticated"));
    }

    // Super admin can access everything
    if ((user as any)?.role?.name === RoleName.super_admin) {
      return next();
    }

    let hasAccess = false;

    // Check access based on what resource is being accessed
    if (okrId && !sprintId && !taskId) {
      // Accessing specific OKR
      hasAccess = await checkOkrAccess(user.id, okrId);
    } else if (sprintId && !okrId && !taskId) {
      // Accessing specific Sprint
      hasAccess = await checkSprintAccess(user.id, sprintId);
    } else if (taskId) {
      // Accessing specific Task
      hasAccess = await checkTaskAccess(user.id, taskId);
    } else if (req.query.mentee_id && req.query.sprint_id && req.query.okr_id) {
      // Accessing tasks via query params - check if user matches mentee_id or has access to the OKR
      const menteeId = req.query.mentee_id as string;
      const querySprintId = req.query.sprint_id as string;
      const queryOkrId = req.query.okr_id as string;
      
      if (menteeId === user.id) {
        hasAccess = true;
      } else {
        hasAccess = await checkOkrAccess(user.id, queryOkrId) || await checkSprintAccess(user.id, querySprintId);
      }
    } else {
      // For general endpoints without specific resource IDs, allow access
      // These will be filtered at the service level
      return next();
    }

    if (!hasAccess) {
      return next(new HttpException(403, "Access denied: You are not assigned to this OKR resource"));
    }

    next();
  } catch (error) {
    next(new HttpException(422, "Error checking OKR assignment access"));
  }
};

async function checkOkrAccess(userId: string, okrId: string): Promise<boolean> {
  // Check if user is assigned as mentee to this OKR
  const okrMenteeAssignment = await ModelOkrMentee.query()
    .where('okr_id', okrId)
    .where('mentee_id', userId)
    .first();
  
  if (okrMenteeAssignment) return true;

  // Check if user is the mentor who created this OKR
  const okr = await ModelOkr.query()
    .where('id', okrId)
    .where('mentor_id', userId)
    .first();
  
  if (okr) return true;

  // Check if user is squad leader of the sprint containing this OKR
  const sprintAccess = await ModelOkr.query()
    .where('id', okrId)
    .join('sprint', 'okr.sprint_id', 'sprint.id')
    .where('sprint.squad_leader_id', userId)
    .first();
  
  return !!sprintAccess;
}

async function checkSprintAccess(userId: string, sprintId: string): Promise<boolean> {
  // Check if user is the squad leader
  const sprint = await ModelSprint.query()
    .where('id', sprintId)
    .where('squad_leader_id', userId)
    .first();
  
  if (sprint) return true;

  // Check if user is the mentor
  const mentorSprint = await ModelSprint.query()
    .where('id', sprintId)
    .where('mentor_id', userId)
    .first();
  
  if (mentorSprint) return true;

  // Check if user is assigned to any OKR in this sprint
  const okrAssignment = await ModelOkrMentee.query()
    .join('okr', 'okr_mentee.okr_id', 'okr.id')
    .where('okr.sprint_id', sprintId)
    .where('okr_mentee.mentee_id', userId)
    .first();
  
  if (okrAssignment) return true;

  // Check if user is assigned to any task in this sprint
  const taskAssignment = await ModelOkrTaskMentee.query()
    .join('okr_task', 'okr_task_mentee.okr_task_id', 'okr_task.id')
    .where('okr_task.sprint_id', sprintId)
    .where('okr_task_mentee.mentee_id', userId)
    .first();
  
  return !!taskAssignment;
}

async function checkTaskAccess(userId: string, taskId: string): Promise<boolean> {
  // Check if user is assigned to this task
  const taskAssignment = await ModelOkrTaskMentee.query()
    .where('okr_task_id', taskId)
    .where('mentee_id', userId)
    .first();
  
  if (taskAssignment) return true;

  // Check if user is the task creator (mentee who created the task)
  const task = await ModelOkrTask.query()
    .where('id', taskId)
    .where('mentee_id', userId)
    .first();
  
  if (task) return true;

  // Check if user is the mentor of the OKR containing this task
  const mentorAccess = await ModelOkrTask.query()
    .where('id', taskId)
    .join('okr', 'okr_task.okr_id', 'okr.id')
    .where('okr.mentor_id', userId)
    .first();
  
  if (mentorAccess) return true;

  // Check if user is squad leader of the sprint containing this task
  const squadLeaderAccess = await ModelOkrTask.query()
    .where('id', taskId)
    .join('sprint', 'okr_task.sprint_id', 'sprint.id')
    .where('sprint.squad_leader_id', userId)
    .first();
  
  return !!squadLeaderAccess;
}

export default okrAssignmentGuardMiddleware;