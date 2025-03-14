import { HttpException } from "@exceptions/HttpException";
import { generateId } from "@utils/util";
import { Squad } from "@/interfaces/squad.interface";
import { ModelSquad } from "@/models/squad.model";
import { ModelSchedule } from "@/models/schedule.model";
import { ModelScheduleSession } from "@/models/schedule_session.model";
import { raw } from "objection";
import { ModelUserInternship } from "@/models/user_internship.model";

class ScheduleService {
  public async findAll(param): Promise<Squad[]> {
    let query = ModelSchedule.query().select('*').from(ModelSchedule.tableName)
    .whereNotDeleted()
    .withGraphFetched("[session(notDeleted).user_internship.[mentee,internship.mentor,document(filterAttachment)]]")
    .modifiers({
      notDeleted(builder) {
        builder.where('deleted_at',null);
        builder.orderBy('time_start')
      },
      filterAttachment(builder) {
        builder.where('key','curriculum_vitae');
        builder.orWhere('key','personality_test');
      }
    });;
    if(param.status){
      if(param.status == 'past'){
        query = query.where(raw('date::date < current_date'));
      }
      if(param.status == 'schedule'){
        query = query.where(raw('date::date = current_date'));
      }
      if(param.status == 'upcoming'){
        query = query.where(raw('date::date > current_date'));
      }
    }
    if(param.month){
      query = query.where(raw(`EXTRACT(MONTH FROM date::date) = ${param.month}`));
    }

    const page = param.page - 1;
    const data:any = await query.page(page, param.perPage);
    return data;
  }

  public async findById(id: string): Promise<Squad> {
    const data: any = await ModelSchedule.query().findById(id).withGraphFetched("[session.user_internship]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async findByMentor(id: string): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query().select('*').from(ModelSquad.tableName).where('mentor_id','=',id)
    .whereNotDeleted()
    .withGraphFetched("[mentee.user_internship.internship,mentor,sprint.okr.okr_task]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: any): Promise<any> {
    //check date if exist
    const query = await ModelSchedule.query().select('*')
    .from(ModelSchedule.tableName)
    .whereNotDeleted()
    .where(`date`,param.date)
    .first()

    if(query){
      throw new HttpException(409, "date already reserved!");
    }

    const paramSchedule = {
      date: param.date,
    }
    const createData:any = await ModelSchedule.query()
      .insert({ id: generateId(), ...paramSchedule })
      .into(ModelSchedule.tableName);
    
    //insert session
    if(param.session.length){
      for (let index = 0; index < param.session.length; index++) {
        const element = param.session[index];
        const paramSession = {
          schedule_id: createData.id,
          time_start: element.time_start,
          time_end: element.time_end,
          zoom_link: element.zoom_link
        }
        const createSession:any = await ModelScheduleSession.query()
        .insert({ id: generateId(), ...paramSession })
        .into(ModelScheduleSession.tableName);
        console.log(createSession)
      }
    }
    
    return createData;
  }

  public async update(id: string, param: any): Promise<Squad> {
    const query = await ModelSchedule.query().select('*')
    .from(ModelSchedule.tableName)
    .whereNotDeleted()
    .where(`date`,param.date)
    .first()

    if(query){
      throw new HttpException(409, "date already reserved!");
    }
    const paramSchedule = {
      date: param.date,
    }
    const createData:any = await ModelSchedule.query()
      .update({...paramSchedule })
      .where("id", "=", id)
      .into(ModelSchedule.tableName);
    
    return createData;
  }

  public async updateSession(id: string, param: any): Promise<Squad> {
    const paramSchedule = {
      time_start: param.time_start,
      time_end: param.time_end
    }
    const createData:any = await ModelScheduleSession.query()
      .update({ ...paramSchedule })
      .where("id", "=", id)
      .into(ModelScheduleSession.tableName);
    
    return createData;
  }

  public async deleteSession(id: string): Promise<Squad> {
    const data: any = await ModelScheduleSession.query().select().from(ModelScheduleSession.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelScheduleSession.query().delete().where("id", "=", id).into(ModelScheduleSession.tableName);

    const updateUser:any = await ModelUserInternship.query()
    .update({schedule_session_id:null}).where("schedule_session_id", id).into("user_internship");
   console.log(updateUser)

    return data;
  }

  public async delete(id: string): Promise<Squad> {
    const data: any = await ModelSchedule.query().select().from(ModelSchedule.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelSchedule.query().delete().where("id", "=", id).into(ModelSchedule.tableName);

    const updateUser:any = await ModelUserInternship.query()
    .update({schedule_id:null,schedule_session_id:null}).where("schedule_id", id).into("user_internship");
    console.log(updateUser)

    return data;
  }
}

export default ScheduleService;
