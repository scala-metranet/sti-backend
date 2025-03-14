import { raw } from "objection";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelLeaderboard } from "@/models/leaderboard.model";
import { HttpException } from "@/exceptions/HttpException";
import { generateId } from "@/utils/util";
import { ModelAttendance } from "@/models/attendance.model";
import moment from "moment";

class LeaderboardService {
  public async generateScore(param:any): Promise<any> {
    //general generate
    let generateOverall:any = ModelUserInternship.query()
    .select(
      'user_internship.mentee_id',
      'user_internship.internship_id',
      raw(`sum(case 
        when okr_task.status = 'Finished' then 1 else 0
        end)::integer as total`),
      raw(`count(okr_task.id)::integer as total_okr`),
      raw(`case 
      when count(okr_task.id) = 0 then 0 
      else CAST( ((sum(case when okr_task.status = 'Finished' then 1 else 0 end))::numeric / (count(okr_task.id))::numeric) as float )
      end as percent`),
      raw('(sum(scoring.score) / count(scoring.id)) as scoring_score')
    )
    .leftJoin('internship','internship.id','=','user_internship.internship_id')
    .leftJoin('user','user.id','=','user_internship.mentee_id')
    .leftJoin('okr_task','user.id','=','okr_task.mentee_id')
    .leftJoin('scoring','scoring.user_id','=','user.id')
    .where('user.status','=','active')
    .where('user.id','=',param.user_id)
    .whereNull('user.deleted_at')
    .whereNull('okr_task.deleted_at')

    generateOverall = generateOverall.where('user_internship.status','=','active');
    generateOverall = generateOverall.groupBy('user_internship.mentee_id','user_internship.internship_id');
    generateOverall = await generateOverall.orderBy('percent').first();
    // const page = param.page - 1;
    // const overall:any = await generateOverall.first();
    
    //per sprint
    let generateSprint:any = ModelUserInternship.query()
    .select(
      'user_internship.mentee_id',
      'user_internship.internship_id',
      'okr_task.month',
      'okr_task.year',
      raw(`sum(case 
        when okr_task.status = 'Finished' then 1 else 0
        end)::integer as total`),
      raw(`count(okr_task.id)::integer as total_okr`),
      raw(`case 
      when count(okr_task.id) = 0 then 0 
      else CAST( ((sum(case when okr_task.status = 'Finished' then 1 else 0 end))::numeric / (count(okr_task.id))::numeric) as float )
      end as percent`),
      raw('CAST((sum(scoring.score) / count(scoring.id)) as float) as scoring_score')
    )
    .leftJoin('internship','internship.id','=','user_internship.internship_id')
    .leftJoin('user','user.id','=','user_internship.mentee_id')
    .leftJoin('okr_task','user.id','=','okr_task.mentee_id')
    .leftJoin('okr','okr.id','=','okr_task.okr_id')
    .leftJoin('scoring',builder => {
      builder.on('scoring.user_id','user.id');
      builder.on('scoring.month','okr_task.month');
      builder.on('scoring.year','okr_task.year');
    })
    .where('user.status','=','active')
    .where('user.id','=',param.user_id)
    .whereNull('user.deleted_at')
    .whereNull('okr_task.deleted_at')
    .whereNotNull('okr_task.month')

    generateSprint = generateSprint.where('user_internship.status','=','active');
    generateSprint = generateSprint.groupBy('user_internship.mentee_id','user_internship.internship_id','okr_task.year','okr_task.month');
    generateSprint = await generateSprint.orderBy('percent');
    // const page = param.page - 1;
    // const persprint: any = await generateSprint;
    const data = {}
    if(generateOverall != undefined){
      //count score attendance
      const scoreAttendance = await ModelAttendance.query().where('user_id',param.user_id).where('isScored',false)
      for (let index = 0; index < scoreAttendance.length; index++) {
        const val = scoreAttendance[index]
        let scoreCheckIn = 4;
        let scoreCheckOut = 4;

        const checkIn = moment(val.check_in,'HH:mm')
        const checkOut = moment(val.check_out,'HH:mm')

        const checkInbeforeTime = moment('07:30', 'HH:mm');
        const checkInafterTime = moment('08:30', 'HH:mm');

        const checkOutbeforeTime = moment('17:00', 'HH:mm');
        const checkOutafterTime = moment('20:30', 'HH:mm');

        if(!checkIn.isBetween(checkInbeforeTime,checkInafterTime)){
          scoreCheckIn = 3
        }

        if(!checkOut.isBetween(checkOutbeforeTime,checkOutafterTime)){
          scoreCheckOut = 3
        }

        if(val.check_out == null){
          scoreCheckOut = 0
        }

        const totalScore = scoreCheckIn + scoreCheckOut

        await ModelAttendance.query().where('id',val.id).update({
          score:totalScore,
          isScored:true
        })
      }
      const attendance_score:any = await ModelAttendance.query().where('user_id',param.user_id).where('isScored',true).sum('score').first()
      const okr_score = generateOverall.percent*200
      const overall:any = {
        id: generateId(),
        user_id: generateOverall.mentee_id,
        okr_done: generateOverall.total,
        okr_total: generateOverall.total_okr,
        okr_score: okr_score > 200 ? 200 : okr_score,
        scoring_score: generateOverall.scoring_score == null? 0 : generateOverall.scoring_score,
        internship_id: generateOverall.internship_id,
        attendance_score: attendance_score? attendance_score.sum : 0,
        final_score: (okr_score)+parseInt(generateOverall.scoring_score)+parseInt(attendance_score? attendance_score.sum : 0)
      }
  
      //input to leaderboard database
      //delete all data from user id
      const delteResult = await ModelLeaderboard.query().delete().where('user_id',param.user_id).into(ModelLeaderboard.tableName);
      // if (!delteResult) throw new HttpException(409, "Data failed to input");
      console.log(delteResult);
  
      const createResult = await ModelLeaderboard.query().insert(overall).into(ModelLeaderboard.tableName)
      console.log(createResult)
      // if (!createResult) throw new HttpException(409, "Data failed to input");
  
      for (let index = 0; index < generateSprint.length; index++) {
        const value = generateSprint[index];
        const attendance_score:any = await ModelAttendance.query()
        .where(raw('EXTRACT(MONTH FROM check_in::date)'),'=',value.month)
        .where('user_id',param.user_id).where('isScored',true).sum('score').first()

        const okr_score:any = value.percent*200
        const scoring_score = value.scoring_score == null? 0 : value.scoring_score
        const att_score = attendance_score && attendance_score.sum ? attendance_score.sum : 0
        console.log(okr_score,scoring_score,att_score)
        const sprint:any = {
          id: generateId(),
          user_id: value.mentee_id,
          okr_done: value.total,
          okr_total: value.total_okr,
          okr_score: okr_score > 200 ? 200 : parseFloat(okr_score).toFixed(2),
          scoring_score: scoring_score,
          attendance_score: att_score,
          internship_id: value.internship_id,
          // sprint_id: value.sprint_id,
          month: value.month,
          year: value.year,
          final_score: (okr_score)+parseInt(scoring_score)+parseInt(att_score)
        }
        const createSprint = await ModelLeaderboard.query().insert(sprint).into(ModelLeaderboard.tableName)
        if (!createSprint) throw new HttpException(409, "Data failed to input");
      }
    }
    return data;
  }
}

export default LeaderboardService;
