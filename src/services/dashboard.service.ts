import { raw } from "objection";
import { ModelOkrTask } from "@/models/okr_task.model";
import { ModelLeaderboard } from "@/models/leaderboard.model";
import { ModelScoring } from "@/models/scoring.model";
import { Roles } from "@/models/roles.model";
import { ModelUserInternship } from "@/models/user_internship.model";

class DashboardService {
  public async getSummaryAdmin(): Promise<any> {
    const totalMentee:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .count().first();

    const totalMenteeActive:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .where('user_internship.status','active')
    .count().first();

    const totalMenteeGraduate:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .where('user_internship.status','graduate')
    .count().first();

    const totalMenteeDecline:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .where('user_internship.status','reject')
    .count().first();

    const totalMenteeUnverified:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .where('user_internship.status','unverified')
    .count().first();

    const totalMenteeInterview:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
    .leftJoin('user','user.id','user_internship.mentee_id')
    .whereNull('user.deleted_at')
    .where('user_internship.status','interview')
    .count().first();

    return {
      totalMentee:totalMentee.count,
      totalMenteeUnverified:totalMenteeUnverified.count,
      totalMenteeInterview:totalMenteeInterview.count,
      totalMenteeActive:totalMenteeActive.count,
      totalMenteeGraduate:totalMenteeGraduate.count,
      totalMenteeDecline:totalMenteeDecline.count,
    };
  }

  public async countTask(param:any): Promise<any> {
    let qry:any;
    if(param.user.role.name === 'Mentor'){
       qry = ModelOkrTask.query()
      .select(raw(`count(okr_task.id) as total
        ,count(okr_task.id) filter (where okr_task.acc_mentor != 1) as incomplete
        ,count(okr_task.id) filter (where okr_task.status = 'Finished' and okr_task.acc_mentor = 1) as complete
      `))
      .leftJoin('okr','okr.id','okr_task.okr_id')
      .where('okr.mentor_id',param.user.id)
    }else{
      qry = ModelOkrTask.query()
      .select(raw(`count(okr_task.id) as total
        ,count(okr_task.id) filter (where okr_task.acc_mentor != 1) as incomplete
        ,count(okr_task.id) filter (where okr_task.status = 'Finished' and okr_task.acc_mentor = 1) as complete
      `))
      .where('okr_task.mentee_id',param.user.id)
    }
        
    const data:any[] = await qry
    return data;
  }

  public async getLeaderboard(param:any): Promise<any> {
    //list applicant
    let registrantQuery = ModelLeaderboard.query()
    .leftJoin('internship','internship.id','=','leaderboard.internship_id')
    .leftJoin('user','user.id','=','leaderboard.user_id')
    // .where('user.status','=','active')
    .whereNull('user.deleted_at')
    .withGraphFetched(`[mentee,internship.[province,city],sprint]`)

    if(param.month && param.year){
      registrantQuery = registrantQuery.where('leaderboard.month',param.month);
      registrantQuery = registrantQuery.where('leaderboard.year',param.year);
    }else{
      registrantQuery = registrantQuery.whereNull('leaderboard.month');
      registrantQuery = registrantQuery.whereNull('leaderboard.year');
    }

    if(param.company_id){
      registrantQuery = registrantQuery.where('internship.company_id','=',param.company_id);
    }

    // registrantQuery = registrantQuery.where('internship.period_end','>=','now()');

    if(param.internship_id){
      registrantQuery = registrantQuery.where('internship_id','=',param.internship_id);
    }

    if(param.program_id){
      registrantQuery = registrantQuery.where('internship.program_id','=',param.program_id);
    }
    
    if(param.search){
      registrantQuery = registrantQuery.where(builder => {
        builder.where(raw('LOWER(??)', ['user.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
        builder.orWhere(raw('LOWER(??)', ['internship.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
      });
    }
    registrantQuery = registrantQuery.orderBy('final_score','desc');
    const page = param.page - 1;
    const data: any = await registrantQuery.page(page, param.perPage);

    return data;
  }

  public async getLeaderboardMentor(param:any): Promise<any> {
    //get role id mentor
    const role:any = await Roles.query().where('name','=','Mentor').first()
    //list applicant
    let registrantQuery = ModelScoring.query()
    .select('user.id','user.name as name',raw('CAST((avg(scoring.score)) as float) as score'))
    .leftJoin('user','user.id','=','scoring.user_id')
    .where('user.role_id','=',role.id)
    .whereNull('user.deleted_at')
    .groupBy('user.id')

    if(param.month && param.year){
      registrantQuery = registrantQuery.where('scoring.month',param.month);
      registrantQuery = registrantQuery.where('scoring.year',param.year);
    }

    if(param.company_id){
      registrantQuery = registrantQuery.where('user.company_id','=',param.company_id);
    }
    
    if(param.search){
      registrantQuery = registrantQuery.where(builder => {
        builder.where(raw('LOWER(??)', ['user.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
      });
    }
    registrantQuery = registrantQuery.orderBy('score','desc');
    const page = param.page - 1;
    const data: any = await registrantQuery.page(page, param.perPage);

    return data;
  }

  public async getLeaderboardRekap(param:any): Promise<any> {
    //list applicant
    let registrantQuery = ModelLeaderboard.query()
    .leftJoin('internship','internship.id','=','leaderboard.internship_id')
    .leftJoin('user','user.id','=','leaderboard.user_id')
    .where('user.status','=','active')
    .whereNull('user.deleted_at')
    .withGraphFetched(`[mentee,internship,sprint]`)
    .where('user_id',param.user_id);

    if(param.month && param.year){
      registrantQuery = registrantQuery.where('leaderboard.month',param.month);
      registrantQuery = registrantQuery.where('leaderboard.year',param.year);
    }else{
      registrantQuery = registrantQuery.whereNotNull('leaderboard.month');
      registrantQuery = registrantQuery.whereNotNull('leaderboard.year');
    }

    if(param.company_id){
      registrantQuery = registrantQuery.where('internship.company_id','=',param.company_id);
    }

    if(param.internship_id){
      registrantQuery = registrantQuery.where('internship_id','=',param.internship_id);
    }
    
    if(param.search){
      registrantQuery = registrantQuery.where(builder => {
        builder.where(raw('LOWER(??)', ['user.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
        builder.orWhere(raw('LOWER(??)', ['internship.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
      });
    }
    registrantQuery = registrantQuery.orderBy('final_score','desc');
    const page = param.page - 1;
    const data: any = await registrantQuery.page(page, param.perPage);

    return data;
  }
}

export default DashboardService;
