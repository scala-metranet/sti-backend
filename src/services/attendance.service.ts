import { HttpException } from "@exceptions/HttpException";
import { generateId } from "@utils/util";
import { ModelGraduation } from "@/models/graduation.model";
import { raw } from "objection";
import { ModelAttendance } from "@/models/attendance.model";
import { InternshipProgramId } from "@/dtos/internship.dto";
import LeaderboardService from "./leaderboard.service";

class AttendanceService {
  public async get(param:any): Promise<any[]> {
    const page = param.page - 1;
    let qry = ModelAttendance.query()
    .select('user.id as user_id','user.name as name','user.email as email','user.photo','attendance.*','campus.name as campus')
    .from(ModelAttendance.tableName)
    .leftJoin('user','user.id','attendance.user_id')
    .leftJoin('campus','campus.id','user.campus_id')
    .leftJoin('user_internship','user.id','user_internship.mentee_id')
    .leftJoin('internship','user_internship.internship_id','internship.id')
    .where('user_internship.status','active')
    // .withGraphFetched('[user_internship.mentee]')

    if(param.start_date){
      qry = qry.where(raw(`check_in::date >= '${param.start_date}'`)).where(raw(`check_in::date <= '${param.end_date}'`))
    }

    if(param.health_status){
      qry = qry.where('health_status',param.health_status)
    }

    if(param.user_id){
      qry = qry.where('user_id',param.user_id)
    }

    if(param.working_status){
      qry = qry.where('working_status',param.working_status)
    }

    if(param.internship_type){
      qry = qry.where('internship.program_id',InternshipProgramId[param.internship_type])
    }

    if(param.batch_master_id){
      qry = qry.where('internship.batch_master_id',param.batch_master_id)
    }

    if(param.company_id){
      qry = qry.where('internship.company_id',param.company_id)
    }

    if(param.campus_id){
      qry = qry.where('user.campus_id',param.campus_id)
    }


    if(param.search){
      qry = qry.where("user.name", "ILIKE", "%" + param.search + "%");
    }

    qry = qry.orderBy('id','desc');

    const data:any = await qry.page(page,param.perPage)
    return data;
  }

  public async create(param: any): Promise<any> {
    //conditional checking
    if(param.type === 'check-in'){
      //check if there is exist record for current date
      const check:any = await ModelAttendance.query().where('user_id',param.user.id).where(raw('check_in::date = current_date')).first();
      if(check) throw new HttpException(409, "User sudah melakukan check in!");
    }
    if(param.type === 'check-out'){
      const check:any = await ModelAttendance.query().where('user_id',param.user.id).where(raw('check_in::date = current_date')).first();
      if(!check) throw new HttpException(409, "User belum melakukan check in!");

      const check2:any = await ModelAttendance.query().where('user_id',param.user.id).where(raw('check_out::date = current_date')).first();
      if(check2) throw new HttpException(409, "User sudah melakukan check out!");
    }
    let input:any
    let data:any
    if(param.type === 'check-in'){
      input = {
        user_id: param.user.id,
        photo_in: param.photo,
        loc_in: param.location,
        lng_lat_in: {
          lng: param.lng,
          lat: param.lat
        },
        health_status: param.health_status,
        working_status: param.working_status,
        tod_id: param.tod_id,
        tod: param.tod,
        check_in: new Date()
      }
      data = await ModelAttendance.query().insert({
        id:generateId(),
        ...input
      }).into(ModelAttendance.tableName)
    }
    if(param.type === 'check-out'){
      input = {
        user_id: param.user.id,
        photo_out: param.photo,
        loc_out: param.location,
        lng_lat_out: {
          lng: param.lng,
          lat: param.lat
        },
        check_out: new Date()
      }
      data = await ModelAttendance.query().where('id',param.id).update({
        ...input
      }).into(ModelAttendance.tableName)
      if(!data) throw new HttpException(409, "Fail update data");
      
      data = await ModelAttendance.query().where('id',param.id).first()
    }
    
    if(!data) throw new HttpException(409, "Fail update data");

    const leaderboardService:any = new LeaderboardService;
    await leaderboardService.generateScore({
      user_id:param.user.id
    })

    return data;
  }

  public async getCurrent(param:any): Promise<any[]> {
    //get user internship
    const data:any = await ModelAttendance.query().where('user_id',param.id).where(raw('check_in::date = current_date')).first();
    return data;
  }

  public async getCountGraduation(): Promise<any> {
    const on_review:any = await ModelGraduation.query()
    .from(ModelGraduation.tableName)
    .where('status','on_review')
    .count()
    .first()

    const accepted:any = await ModelGraduation.query()
    .from(ModelGraduation.tableName)
    .where('status','accepted')
    .count()
    .first()

    const revision:any = await ModelGraduation.query()
    .from(ModelGraduation.tableName)
    .where('status','revision')
    .count()
    .first()

    return {
      on_review:on_review.count,
      accepted:accepted.count,
      revision:revision.count
    };
  }

}

export default AttendanceService;
