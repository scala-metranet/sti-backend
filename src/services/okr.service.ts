import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Squad } from "@/interfaces/squad.interface";
import { ModelSquad } from "@/models/squad.model";
import { ModelSprint } from "@/models/sprint.model";
import { ModelOkr } from "@/models/okr.model";
import { ModelOkrMentee } from "@/models/okr_mentee.model";
import { Sprint } from "@/interfaces/sprint.interface";
import moment from "moment";
import { ModelOkrTask } from "@/models/okr_task.model";
import { ModelOkrTaskMentee } from "@/models/okr_task_mentee.model";
import { OkrTask } from "@/interfaces/okr_task.interface";
import { ModelOkrTaskResult } from "@/models/okr_task_result.model";
import LeaderboardService from "./leaderboard.service";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUser } from "@/models/user.model";
import { ModelSprintActivity } from "@/models/sprint_activity.model";
import { PartialModelObject, Transaction } from "objection";

class OkrService {
  public async findAll(): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query().select("*").from(ModelSquad.tableName).withGraphFetched("[mentee,mentor]");
    return data;
  }

  public async findAllByUser(userId: string): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query()
      .select("*")
      .from(ModelSquad.tableName)
      .where(builder => {
        builder.where("mentor_id", userId)
          .orWhereExists(ModelUser.query()
            .select('id')
            .from('user')
            .where('squad_id', ModelSquad.ref('id'))
            .where('id', userId)
          );
      })
      .withGraphFetched("[mentee,mentor]");
    return data;
  }

  public async findById(id: string, userCompanyId?: string): Promise<Sprint> {
    let query = ModelSprint.query()
      .findById(id)
      .withGraphFetched("[squad_leader,okr.[okr_task.[task_mentee.mentee,task_result.user],okr_mentee.mentee],project.company]")
      .modifyGraph('okr.okr_task',builder => {
        builder.whereNull('deleted_at');
        builder.orderBy('id','asc');
      })
      .modifyGraph('okr',builder => {
        builder.orderBy('id','asc');
      });

    const data: any = await query;
    if (!data) throw new HttpException(409, "Sprint doesn't exist");

    // Company-based access control
    if (userCompanyId && data.project && data.project.company_id !== userCompanyId) {
      throw new HttpException(403, "Access denied: Sprint belongs to different company");
    }

    return data;
  }

  public async findByMentor(id: string): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query()
      .select("*")
      .from(ModelSquad.tableName)
      .where("mentor_id", "=", id)
      .withGraphFetched("[mentee.user_internship.internship,mentor]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async findBySquad(id: string): Promise<any> {
    const currentSprint: Sprint[] = await ModelSprint.query().select('*')
    .from(ModelSprint.tableName)
    .where('squad_id','=',id)
    .where('start_date','<=',moment().format('YYYY-MM-DD'))
    .where('end_date','>=',moment().format('YYYY-MM-DD'))
    .withGraphFetched('[squad_leader,okr.okr_task]')
    .modifyGraph('okr.okr_task',builder => {
      builder.whereNull('deleted_at');
      builder.orderBy('id','asc');
    });
    if (!currentSprint) throw new HttpException(409, "Data doesn't exist");

    const historySprint: Sprint[] = await ModelSprint.query().select('*')
    .from(ModelSprint.tableName)
    .where('squad_id','=',id)
    // .where('start_date','>',moment().format('YYYY-MM-DD'))
    .where('end_date','<',moment().format('YYYY-MM-DD'))
    .withGraphFetched('[squad_leader,okr.okr_task]')
    .modifyGraph('okr.okr_task',builder => {
      builder.whereNull('deleted_at');
      builder.orderBy('id','asc');
    });
    if (!historySprint) throw new HttpException(409, "Data doesn't exist");

    const upcomingSprint: Sprint[] = await ModelSprint.query().select('*')
    .from(ModelSprint.tableName)
    .where('squad_id','=',id)
    .where('start_date','>',moment().format('YYYY-MM-DD'))
    // .where('end_date','<',moment().format('YYYY-MM-DD'))
    .withGraphFetched('[squad_leader,okr.okr_task]')
    .modifyGraph('okr.okr_task',builder => {
      builder.whereNull('deleted_at');
      builder.orderBy('id','asc');
    });
    if (!historySprint) throw new HttpException(409, "Data doesn't exist");

    return { currentSprint: currentSprint, historySprint: historySprint, upcomingSprint:upcomingSprint };
  }

  public async create(param: any): Promise<any> {
    //input sprint
    const paramSprint = {
      sprint: param.sprint,
      objective: param.objective,
      start_date: param.start_date,
      end_date: param.end_date,
      squad_leader_id: param.squad_leader_id,
      squad_id: param.squad_id,
      mentor_id: param.mentor_id,
    };
    const createData: any = await ModelSprint.query()
      .insert({ id: generateId(), ...paramSprint })
      .into(ModelSprint.tableName);
    //input okr
    const paramOkr = [];
    const paramOkrMentee = [];
    param.okr.map(e => {
      let okr_id = generateId();
      paramOkr.push({
        id: okr_id,
        key_result: e.key_result,
        output: e.output,
        due_date: e.due_date,
        description: e.description,
        mentor_id: param.mentor_id,
        sprint_id: createData.id,
      });
      e.assigned_to.map(ass => {
        paramOkrMentee.push({
          id: generateId(),
          okr_id: okr_id,
          mentee_id: ass.value,
        });
      });
    });

    const createOkr: any = await ModelOkr.query().insert(paramOkr).into(ModelOkr.tableName);
    if (!createOkr) throw new HttpException(409, "Data failed to input");

    const createOkrMentee: any = await ModelOkrMentee.query().insert(paramOkrMentee).into(ModelOkrMentee.tableName);
    if (!createOkrMentee) throw new HttpException(409, "Data failed to input");

    return createData;
  }

  public async getSprint(id: string): Promise<any> {
    const user = await ModelUser.query().findById(id);
    if (!user) throw new HttpException(404, "User doesn't exist");

    const today = moment().format("YYYY-MM-DD");

    // --- ownership by okr_mentee ---
    const whereByMentee = (qb: any) => {
      qb.whereExists(
        ModelOkrMentee.query()
          .select(1)
          .join("okr", "okr.id", "okr_mentee.okr_id")
          .where("okr_mentee.mentee_id", user.id)
          .whereRaw("okr.sprint_id = sprint.id")
      );
    };

    const baseGraph = (b: any) => {
      b.whereNull("okr_task.deleted_at").orderBy("okr_task.id", "asc");
    };

    const currentSprint = await ModelSprint.query()
      .select("sprint.*")
      .from("sprint")
      .where(whereByMentee)
      .where("sprint.start_date", "<=", today)
      .where("sprint.end_date", ">=", today)
      .whereNotDeleted()
      .withGraphFetched("okr.[okr_task]") // eager load okr + tasks
      .modifyGraph("okr.okr_task", baseGraph);

    const historySprint = await ModelSprint.query()
      .select("sprint.*")
      .from("sprint")
      .where(whereByMentee)
      .where("sprint.end_date", "<", today)
      .whereNotDeleted()
      .orderBy("sprint.id", "desc")
      .withGraphFetched("okr.[okr_task]")
      .modifyGraph("okr.okr_task", baseGraph);

    const upcomingSprint = await ModelSprint.query()
      .select("sprint.*")
      .from("sprint")
      .where(whereByMentee)
      .where("sprint.start_date", ">", today)
      .whereNotDeleted()
      .withGraphFetched("okr.[okr_task]")
      .modifyGraph("okr.okr_task", baseGraph);

    return {
      currentSprint,
      historySprint,
      upcomingSprint,
    };
  }


  public async getSprintActivity(id: any): Promise<any> {
    const activity:any = await ModelSprintActivity.query().where('sprint_id',id).withGraphFetched('[user]').orderBy('id','desc');
    if (!activity) throw new HttpException(409, "Data failed to fetch");

    return activity;
  }

  public async getSprintAssign(id: any): Promise<any> {
    const internship:any = await ModelUserInternship.query().where('id',id).first();
    if (!internship) throw new HttpException(409, "Data failed to fetch");
    //input sprint
    const list:any = await ModelUserInternship.query().where('internship_id',internship.internship_id).where('status','active').withGraphFetched('[mentee]')
    return list;
  }

  public async createSprintKr(param: any): Promise<any> {
    const sprint = await ModelSprint.query().findById(param.sprint_id);
    if (!sprint) throw new HttpException(404, "Sprint doesn't exist");

    const {
      key_result,
      output,
      description,
      due_date,
      user_id,
      sprint_id,
      assigned_to = [] as string[],
    } = param;

    const result = await ModelOkr.transaction(async (trx: Transaction) => {
      // --- create OKR ---
      const payload: PartialModelObject<ModelOkr> = {
        id: generateId(),
        mentor_id: user_id,
        key_result,
        output,
        description,
        due_date,
        sprint_id,
      };

      const okr = await ModelOkr.query(trx).insert(payload);

      // assigne mentee
      if (Array.isArray(assigned_to) && assigned_to.length > 0) {
        const okrMentees: PartialModelObject<ModelOkrMentee>[] = assigned_to.map((menteeId) => {
          return {
            id: generateId(),
            okr_id: okr.id,
            mentee_id: menteeId,
          }
        })

        await ModelOkrMentee.query(trx).insert(okrMentees);
      }

      await this.createSprintLog(user_id, sprint_id, `membuat KR ${key_result} pada sprint`);

      return okr;
    });

    return result;
  }

  public async createSprint(param: any): Promise<any> {
    if (!param.project_id) {
      throw new HttpException(400, "project_id is required");
    }

    const { ModelProject } = require('@/models/project.model');
    const { ModelProjectMentor } = require('@/models/project_mentor.model');
    
    // Check if project exists
    const project = await ModelProject.query().findById(param.project_id);
    if (!project) throw new HttpException(409, "Project not found");
    
    // Check if current user is assigned as mentor to this project
    const projectMentor = await ModelProjectMentor.query()
      .where('project_id', param.project_id)
      .where('mentor_id', param.user_id)
      .first();
    
    if (!projectMentor) {
      throw new HttpException(403, "Only assigned mentors can create sprints for this project");
    }

    // Count existing sprints in same project for sequential numbering
    const sprintCount = await ModelSprint.query()
      .where('project_id', param.project_id)
      .whereNotDeleted()
      .resultSize();
    const sprintNum = sprintCount + 1;
    
    //input sprint
    const paramSprint = {
      sprint: param.sprint || `SPRINT #${sprintNum}`,
      mentor_id: param.user_id,
      objective: param.objective,
      start_date: param.start_date,
      end_date: param.end_date,
      project_id: param.project_id
    };
    const createData: any = await ModelSprint.query()
      .insert({ id: generateId(), ...paramSprint })
      .into(ModelSprint.tableName);

    //sprint activity
    await this.createSprintLog(param.user_id,createData.id,'membuat sprint');
    return createData;
  }

  public async createSprintLog(user_id:any,sprint_id:any,message:any){
    const user:any = await ModelUser.query().where('id',user_id).first();
    if (!user) throw new HttpException(409, "Data failed to input");

    const sprint:any = await ModelSprint.query().where('id',sprint_id).first();
    if (!sprint) throw new HttpException(409, "Data failed to input");

    let activity = `${user.name} ${message} ${sprint.sprint}`;

    const createActivity:any = await ModelSprintActivity.query().insert({
      id:generateId(),
      sprint_id: sprint_id,
      user_id: user_id,
      message: activity
    }).into(ModelSprintActivity.tableName)
    if (!createActivity) throw new HttpException(409, "Data failed to input");
  }

  public async updateSprint(param: any): Promise<any> {
    //input sprint
    const paramSprint = {
      sprint: param.sprint,
      objective: param.objective,
      start_date: param.start_date,
      end_date: param.end_date
    };
    const createData: any = await ModelSprint.query()
      .update({ ...paramSprint })
      .where('id',param.id)
      .into(ModelSprint.tableName);
    if (!createData) throw new HttpException(409, "Data failed to input");

    const data: any = await ModelSprint.query()
      .where('id',param.id)
      .first()
    await this.createSprintLog(param.user_id,data.id,'update sprint');
    return data;
  }

  public async deleteSprint(param: any): Promise<any> {
    const deleteData: any = await ModelSprint.query()
      .where('id',param.id)
      .into(ModelSprint.tableName)
      .delete();
    if (!deleteData) throw new HttpException(409, "Data failed to delete");
    
    await this.createSprintLog(param.user_id,param.id,'delete sprint');
    return deleteData;
  }

  public async getTask(param: any): Promise<OkrTask[]> {
    //get task
    const okrTask:any[] = await ModelOkrTask.query()
    .where("mentee_id", param.mentee_id)
    .where("sprint_id", param.sprint_id)
    .where("okr_id", param.okr_id)
    .whereNotDeleted()
    .withGraphFetched("[okr,task_mentee.mentee,task_result.user]");

    return okrTask;
  }

  public async getTaskByUser(param: any, userId: string): Promise<OkrTask[]> {
    const okrTask:any[] = await ModelOkrTask.query()
      .where("sprint_id", param.sprint_id)
      .where("okr_id", param.okr_id)
      .whereNotDeleted()
      .where(builder => {
        builder.where("mentee_id", userId)
          .orWhereExists(ModelOkrTaskMentee.query()
            .where('okr_task_id', ModelOkrTask.ref('id'))
            .where('mentee_id', userId))
          .orWhereExists(ModelOkr.query()
            .where('id', param.okr_id)
            .where('mentor_id', userId))
          .orWhereExists(ModelSprint.query()
            .where('id', param.sprint_id)
            .where(subBuilder => {
              subBuilder.where('squad_leader_id', userId)
                .orWhere('mentor_id', userId);
            }));
      })
      .withGraphFetched("[okr,task_mentee.mentee,task_result.user]");

    return okrTask;
  }

  public async createTask(param: any): Promise<OkrTask[]> {
    //input sprint
    const sprint:any = await ModelSprint.query().where('id',param.sprint_id).first();
    let month = moment().format('M');
    let year = moment().format('YYYY');
    if(sprint){
      month = moment(sprint.start_date).format('M');
      year = moment(sprint.start_date).format('YYYY');
    }
    const paramTask = {
      title: param.name,
      mentee_id: param.mentee_id,
      due_date: param.due_date,
      result: "",
      status: param.status,
      okr_id: param.okr_id,
      sprint_id: param.sprint_id,
      month:month,
      year:year
    };
    const createData: any = await ModelOkrTask.query()
      .insert({ id: generateId(), ...paramTask })
      .into(ModelOkrTask.tableName);

    //input task mentee
    const paramTaskMentee = [];
    param.assigned_to.map(ass => {
      paramTaskMentee.push({
        id: generateId(),
        okr_task_id: createData.id,
        mentee_id: ass.value,
      });
    });

    const createTaskMentee: any = await ModelOkrTaskMentee.query().insert(paramTaskMentee).into(ModelOkrTaskMentee.tableName);
    if (!createTaskMentee) throw new HttpException(409, "Data failed to input");
    
    const leaderboardService:any = new LeaderboardService;
    await leaderboardService.generateScore({
      user_id:param.mentee_id
    })

    const okrTask: OkrTask[] = await ModelOkrTask.query().where("okr_id", param.okr_id).withGraphFetched("[task_mentee.mentee,task_result.user]");
    return okrTask;
  }

  public async updateTask(param: any): Promise<OkrTask> {
    //input sprint
    const user_id = param.user_id 
    const assigned_to = param.assigned_to
    delete param.user_id
    delete param.assigned_to
    const paramupdate = {...param}
    delete paramupdate.task_id
    await ModelOkrTask.query().update({ ...paramupdate }).where("id", "=", param.task_id).into("okr_task");

    let paramResult = {};
    if(param.status != undefined || param.acc_mentor != undefined){
      paramResult = {
        id:generateId(),
        user_id: user_id,
        message: 'Task diubah menjadi '+(param.status?param.status:(param.acc_mentor == 1?'Diterima':'Ditolak')),
        okr_task_id: param.task_id
      }
    }else{
      paramResult = {
        id:generateId(),
        user_id: user_id,
        message: 'Informasi task diubah.',
        okr_task_id: param.task_id
      }
    }

    //delete
    if(assigned_to){
      const deleteTaskMentee:any = await ModelOkrMentee.query().where('okr_task_id',param.task_id).delete()
      if (!deleteTaskMentee) throw new HttpException(409, "Data failed to input");

      const paramTaskMentee = [];
      assigned_to.map(ass => {
        paramTaskMentee.push({
          id: generateId(),
          okr_task_id: param.task_id,
          mentee_id: ass.value,
        });
      });

      const createTaskMentee: any = await ModelOkrTaskMentee.query().insert(paramTaskMentee).into(ModelOkrTaskMentee.tableName);
      if (!createTaskMentee) throw new HttpException(409, "Data failed to input");
    }

    const createResult = await ModelOkrTaskResult.query().insert(paramResult).into(ModelOkrTaskResult.tableName)
    if (!createResult) throw new HttpException(409, "Data failed to input");
    
    const okrTask:any = await ModelOkrTask.query().where("id", param.task_id).withGraphFetched("[okr,task_mentee.mentee,task_result.user]").first();
    const leaderboardService:any = new LeaderboardService;
    await leaderboardService.generateScore({
      user_id:user_id
    })
    return okrTask;
  }

  public async updateResult(param: any): Promise<any> {
    //input okr result
    const paramResult = {
      id:generateId(),
      user_id: param.user_id,
      message: param.result,
      attachment: param.attachment,
      okr_task_id: param.id
    }
    const createResult = await ModelOkrTaskResult.query().insert(paramResult).into(ModelOkrTaskResult.tableName)
    if (!createResult) throw new HttpException(409, "Data failed to input");

    const okrTask: OkrTask = await ModelOkrTask.query().where("id", param.id).withGraphFetched("[task_mentee.mentee,task_result.user]").first();
    return okrTask;
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const okr = param.okr
    delete param.okr
    //update sprint
    const paramSprint = param 
    const createData: any = await ModelSprint.query()
      .update({ ...paramSprint })
      .where("id", "=", id)
      .into(ModelSprint.tableName);
    if (!createData) throw new HttpException(409, "Data failed to input");

    if(okr.length){
      //input okr
      const paramOkr = [];
      const paramOkrMentee = [];
      okr.map(e => {
        let okr_id = generateId();
        paramOkr.push({
          id: okr_id,
          key_result: e.key_result,
          output: e.output,
          due_date: e.due_date,
          description: e.description,
          mentor_id: param.mentor_id,
          sprint_id: id,
        });
        e.assigned_to.map(ass => {
          paramOkrMentee.push({
            id: generateId(),
            okr_id: okr_id,
            mentee_id: ass.value,
          });
        });
      });

      //delete data OKR
      await ModelOkr.query().delete().where("sprint_id", "=", id).into(ModelOkr.tableName);

      const createOkr: any = await ModelOkr.query().insert(paramOkr).into(ModelOkr.tableName);
      if (!createOkr) throw new HttpException(409, "Data failed to input");

      const createOkrMentee: any = await ModelOkrMentee.query().insert(paramOkrMentee).into(ModelOkrMentee.tableName);
      if (!createOkrMentee) throw new HttpException(409, "Data failed to input");
    }

    return {message:'ok'};
  }

  public async inputOkr(param: any,user:any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");
    const okr_mentee = param.assigned_to
    delete param.assigned_to
    //update sprint
    const createOkr: any = await ModelOkr.query()
      .insert({ id:generateId(),...param,mentor_id:user.id })
      .into(ModelOkr.tableName);
    if (!createOkr) throw new HttpException(409, "Data failed to input");

    if(okr_mentee.length){
      for (let index = 0; index < okr_mentee.length; index++) {
        const element = okr_mentee[index];
        const createData: any = await ModelOkrMentee.query()
          .insert({ 
            id:generateId(),
            mentee_id:element.value,
            okr_id:createOkr.id
           })
          .into(ModelOkrMentee.tableName);
        if (!createData) throw new HttpException(409, "Data failed to input");
      }
    }
    return {message:'ok'};
  }

  public async updateOkr(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");
    const okr_mentee = param.assigned_to
    delete param.assigned_to
    //update sprint
    const createData: any = await ModelOkr.query()
      .update({ ...param })
      .where("id", "=", id)
      .into(ModelOkr.tableName);
    if (!createData) throw new HttpException(409, "Data failed to input");

    if(okr_mentee.length){
      //update okr_mentee
      const deleteOkrMentee:any = await ModelOkrMentee.query().delete().where('okr_id',id).into(ModelOkrMentee.tableName)
      if (!deleteOkrMentee) throw new HttpException(409, "Data failed to input");

      for (let index = 0; index < okr_mentee.length; index++) {
        const element = okr_mentee[index];
        const createData: any = await ModelOkrMentee.query()
          .insert({ 
            id:generateId(),
            mentee_id:element.value,
            okr_id:id
           })
          .into(ModelOkrMentee.tableName);
        if (!createData) throw new HttpException(409, "Data failed to input");
      }
    }
    return {message:'ok'};
  }

  public async delete(id: string): Promise<Sprint> {
    const data: Sprint = await ModelSprint.query().select().from(ModelSprint.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelSprint.query().delete().where("id", "=", id).into("sprint");
    return data;
  }

  public async deleteOkr(id: string): Promise<Sprint> {
    const data: any = await ModelOkr.query().select().from(ModelOkr.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelOkr.query().delete().where("id", "=", id).into(ModelOkr.tableName);
    return data;
  }

  public async deleteTask(id: string): Promise<Sprint> {
    const data: any = await ModelOkrTask.query().select().from(ModelOkrTask.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelOkrTask.query().delete().where("id", "=", id).into(ModelOkrTask.tableName);
    const leaderboardService:any = new LeaderboardService;
    await leaderboardService.generateScore({
      user_id:data.mentee_id
    })
    return data;
  }

  public async getSprintsByProject(project_id: string, userCompanyId?: string): Promise<Sprint[]> {
    if (isEmpty(project_id)) throw new HttpException(400, "Project ID is required");

    let query = ModelSprint.query()
      .where('project_id', project_id)
      .withGraphFetched('[project.company, squad_leader, okr]')
      .orderBy('created_at', 'desc');

    const data: any[] = await query;

    // Company-based access control
    if (userCompanyId && data.length > 0) {
      const projectCompanyId = data[0].project?.company?.id;
      if (projectCompanyId && projectCompanyId !== userCompanyId) {
        throw new HttpException(403, "Access denied: Project belongs to different company");
      }
    }

    return data;
  }
}

export default OkrService;
