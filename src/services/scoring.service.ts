import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Campus } from "@/interfaces/campus.interface";
import { ModelScoringQuestion } from "@/models/scoring_question.model";
import { ModelScoring } from "@/models/scoring.model";
import { ModelScoringDetail } from "@/models/scoring_detail.model";
// import { ModelSquad } from "@/models/squad.model";
// import moment from "moment";
import { ModelSprint } from "@/models/sprint.model";
import { ModelUser } from "@/models/user.model";
import LeaderboardService from "./leaderboard.service";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelScoringMaster } from "@/models/scoring_master.model";
import { ModelScoringSection } from "@/models/scoring_section.model";
import { ModelScoringQuestionOption } from "@/models/scoring_question_option.model";
import moment from "moment";
// import { ModelBatchMaster } from "@/models/batch_master.model";
import { JSDOM } from "jsdom";
import { ModelOkrTask } from "@/models/okr_task.model";
import { ModelSprintMaster } from "@/models/sprint_master.model";
import { ModelLeaderboard } from "@/models/leaderboard.model";
class ScoringService {
  public async getMaster(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelScoringMaster.query().select()
    .from(ModelScoringMaster.tableName)
    .withGraphFetched('[internship_program,company,role]')
    .whereNotDeleted()

    if(param.company_id){
      data = data.where('company_id',param.company_id);
    }

    if(param.role_id){
      data = data.where('role_id',param.role_id);
    }

    if(param.internship_program_id){
      data = data.where('internship_program_id',param.internship_program_id);
    }

    data = await data.orderBy('id','desc')
    .page(page,param.perPage);

    return data;
  }
  
  public async get(param:any): Promise<any> {
    // const page = param.page - 1;
    let data:any = ModelScoringQuestion.query().select()
    .from(ModelScoringQuestion.tableName)
    .whereNotDeleted()

    if(param.internship_program_id){
      data = data.where('internship_program_id',param.internship_program_id)
    }

    if(param.role_id){
      data = data.where('role_id',param.role_id)
    }

    if(param.company_id){
      data = data.where('company_id',param.company_id)
    }
    
    data = await data.orderBy('question_order','asc');

    return data;
  }

  public async getHistory(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelScoring.query().select()
    .from(ModelScoring.tableName)
    .withGraphFetched('[sprint,created(filterUser).[role,user_internship(filterUserIntern).internship],user(filterUser).[squad,role,user_internship(filterUserIntern).internship]]')
    .whereNotDeleted()
    .modifiers({
      filterUser(builder){
        builder.select('id','name','email','photo')
      },
      filterUserIntern(builder){
        builder.select('id','internship_id')
      }
    })
    if(param.type != 'admin'){
      data = data.where('created_by',param.user.id);
    }

    if(param.company_id){
      data = data.whereExists(
        ModelUser.query()
          .select('*')
          .where("user.company_id", "=", param.company_id)
          .whereColumn('user.id', 'scoring.user_id')
      )
    }

    if(param.search){
      data = data.whereExists(
        ModelUser.query()
          .select('*')
          .where("user.name", "ILIKE", "%" + param.search + "%")
          .whereColumn('user.id', 'scoring.user_id')
      )
    }

    data = await data.orderBy('id','desc')
    .page(page,param.perPage);

    return data;
  }

  public async getScore(param:any): Promise<any> {
    let data:any = ModelSprint.query().select(
      'sprint.id','sprint.sprint','sprint.objective','sprint.squad_id',
      'sprint.start_date','sprint.end_date'
    )
    .from(ModelSprint.tableName)
    // .where('start_date','<=',moment().format('YYYY-MM-DD'))
    // .where('end_date','>=',moment().format('YYYY-MM-DD'))

    if(param.user.role.name === 'Mentor'){
      data = data.withGraphJoined('[squad_leader(filterSquadLeader).user_internship(filterUserInternship).internship(filterInternship),squad(filterSquad).mentee(filterMentee).user_internship(filterIntern).internship(filterInternship)]')
      .modifiers({
        filterSquadLeader(builder){
          builder.select('id','name')
        },
        filterUserInternship(builder){
          builder.select('id','internship_id')
        },
        filterInternship(builder){
          builder.select('id','name','program_id')
        },
        filterSquad(builder){
          builder.select('id','name','mentor_id','deleted_at')
        },
        filterIntern(builder) {
          builder.select('id','internship_id','mentee_id');
        },
        filterMentee(builder){
          builder.select('id','name','email');
        }
      })
      .where('squad.mentor_id','=',param.user.id)
      .whereNull('squad.deleted_at')
    }else{
      data = data.withGraphJoined('[squad_leader(filterSquadLeader).user_internship(filterUserInternship).internship(filterInternship),squad(filterSquad).mentor(filterMentee)]')
      .modifiers({
        filterSquadLeader(builder){
          builder.select('id','name')
        },
        filterUserInternship(builder){
          builder.select('id','internship_id')
        },
        filterInternship(builder){
          builder.select('id','name','program_id')
        },
        filterSquad(builder){
          builder.select('id','name','mentor_id','deleted_at')
        },
        filterIntern(builder) {
          builder.select('id','internship_id','mentee_id');
        },
        filterMentee(builder){
          builder.select('id','name','email');
        }
      })
      .where('squad.id','=',param.user.squad_id)
      .whereNull('squad.deleted_at')
    }
    data = await data.orderBy('sprint.id')
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //parsing score
    if(param.user.role.name === 'Mentor'){
      const sprint_id = []
      const user_id = []
      data.map(e => {
        sprint_id.push(e.id)
        e.squad.mentee.map(men => {
          user_id.push(men.id)
        })
      })
      let score = []
      if(sprint_id.length && user_id.length){
        score = await ModelScoring.query()
        .where('created_by',param.user.id)
        .whereIn('user_id',user_id)
        .whereIn('sprint_id',sprint_id)
        if (!score) throw new HttpException(409, "Data doesn't exist");
      }
      let datascore = {}
      score.map(e => {
        if(datascore[e.sprint_id] === undefined){
          datascore[e.sprint_id] = {}
        }
        datascore[e.sprint_id][e.user_id] = {
          id: e.id,
          score: e.score
        }
      })
      data.map(e => {
        e.squad.mentee.map(men => {
          men.score = datascore[e.id] != undefined ? (datascore[e.id][men.id] != undefined? datascore[e.id][men.id]:null):null
        })
      })
    }else{
      const sprint_id = []
      data.map(e => {
        sprint_id.push(e.id)
      })
      let score = []
      if(sprint_id.length){
        score = await ModelScoring.query()
        .where('created_by',param.user.id)
        .whereIn('sprint_id',sprint_id)
        if (!score) throw new HttpException(409, "Data doesn't exist");
      }
      let datascore = {}
      score.map(e => {
        if(datascore[e.sprint_id] === undefined){
          datascore[e.sprint_id] = {
            id: e.id,
            score: e.score
          }
        }
      })
      data.map(e => {
        e.squad.mentor.score = datascore[e.id] != undefined ? (datascore[e.id] != undefined? datascore[e.id]:null):null
      })
    }
    return data;
  }

  public async getScoreNew(param:any): Promise<any> {
    let data:any;
    // const batch:any = await ModelBatchMaster.query()
    // .where('period_start','<=',moment().format('YYYY-MM-DD'))
    // .where('period_end','>=',moment().format('YYYY-MM-DD'))
    // .whereNotDeleted()
    // .first();
    // if (!batch) return [];

    //get month
    let month = moment().format('M');
    let year = moment().format('YYYY');

    if(param.query.month){
      let monthParam = parseInt(param.query.month)
      if(monthParam < 10){
        month = `0${monthParam}`
      }
    }

    if(param.query.year){
      year = param.query.year
    }

    if(param.user.role.name === 'Mentor'){
      data = await ModelUserInternship.query()
      .select(
        'user.id as user_id',
        'user.name as user_name',
        'user.photo as user_photo',
        'role.id as role_id',
        'role.name as role_name',
        'internship.id as internship_id',
        'internship.name as internship',
        'internship.program_id as program_id',
        'scoring.id as scoring_id',
        'scoring.score as score',
        'squad.id as squad_id',
        'squad.name as squad_name'
      )
      .from(ModelUserInternship.tableName)
      .leftJoin('internship','internship.id','=','user_internship.internship_id')
      .leftJoin('user','user.id','=','user_internship.mentee_id')
      .leftJoin('role','user.role_id','=','role.id')
      .leftJoin('squad','user.squad_id','=','squad.id')
      .leftJoin('scoring',(builder) => {
        builder.on('scoring.user_id','=','user.id');
        builder.on('scoring.internship_id','=','internship.id');
        builder.onVal('scoring.month',month)
        builder.onVal('scoring.year',year)
        builder.onVal('scoring.created_by',param.user.id)
        // builder.onVal('scoring.deleted_at',null)
      })
      .withGraphFetched('[internship]')
      .where('internship.mentor_id',param.user.id)
      // .where('internship.batch_master_id',batch.id)
      .where('user_internship.status','active')
      .where('user.status','active')
      .whereNull('internship.deleted_at')
      .whereNotNull('user.squad_id')
    }else{
      data = await ModelUserInternship.query()
      .select(
        'user.id as user_id',
        'user.name as user_name',
        'user.photo as user_photo',
        'role.id as role_id',
        'role.name as role_name',
        'internship.id as internship_id',
        'internship.name as internship',
        'internship.program_id as program_id',
        'scoring.id as scoring_id',
        'scoring.score as score',
        'squad.id as squad_id',
        'squad.name as squad_name'
      )
      .from(ModelUserInternship.tableName)
      .leftJoin('internship','internship.id','=','user_internship.internship_id')
      .leftJoin('user','user.id','=','internship.mentor_id')
      .leftJoin('role','user.role_id','=','role.id')
      .leftJoin('squad','user.squad_id','=','squad.id')
      .leftJoin('scoring',(builder) => {
        builder.on('scoring.user_id','=','user.id');
        builder.on('scoring.internship_id','=','internship.id');
        builder.onVal('scoring.month',month)
        builder.onVal('scoring.year',year)
        builder.onVal('scoring.created_by',param.user.id)
        // builder.onVal('scoring.deleted_at',null)
      })
      .withGraphFetched('[internship]')
      .where('user_internship.mentee_id',param.user.id)
      // .where('internship.batch_master_id',batch.id)
      .where('user_internship.status','active')
      .where('user.status','active')
      .whereNull('internship.deleted_at')
    }
    return data;
  }

  public async detailMaster(id:any): Promise<any> {
    const data:any = await ModelScoringMaster.query().select()
    .withGraphFetched('[company,role,internship_program,section.[question.[options]]]')
    .from(ModelScoringMaster.tableName)
    .whereNotDeleted()
    .where('id',id).first();

    return data;
  }

  public async scoreForm(id:any,param:any): Promise<any> {
    const user:any = await ModelUser.query().withGraphFetched('[role]').where('id',id).first();
    if(!user) throw new HttpException(409, "No user found");
    //check role user
    // const role_id:any = user.role_id
    let company_id = null
    let internship_program_id = null
    let is_vip = false
    let internship:any = {}
    if(user.role.name === 'Mentor'){
      company_id = user.company_id
      //get internship program from user
      let user_internship:any = await ModelUserInternship.query().withGraphFetched('[internship]')
      .where('mentee_id',param.user.id)
      .where('status','active')
      .orderBy('id','desc')
      .first()
      if(!user_internship){
        user_internship = await ModelUserInternship.query().withGraphFetched('[internship]')
        .where('mentee_id',param.user.id)
        .where('status','graduate')
        .orderBy('id','desc')
        .first()
      }
      internship_program_id = user_internship.internship.program_id 
      internship = user_internship.internship
      is_vip = param.user.is_vip
    }else{
      //get company id from internship
      let user_internship:any = await ModelUserInternship.query().withGraphFetched('[internship]')
      .where('mentee_id',user.id)
      .where('status','active')
      .orderBy('id','desc')
      .first()
      if(!user_internship){
        user_internship = await ModelUserInternship.query().withGraphFetched('[internship]')
        .where('mentee_id',user.id)
        .where('status','graduate')
        .orderBy('id','desc')
        .first()
      }
      company_id = user_internship.internship.company_id
      internship_program_id = user_internship.internship.program_id 
      internship = user_internship.internship
      is_vip = user.is_vip
    }
    const data:any = await ModelScoringMaster.query().select()
    .withGraphFetched('[company,role,internship_program,section.[question.[options]]]')
    .from(ModelScoringMaster.tableName)
    .whereNotDeleted()
    .where('role_id',param.user.role_id)
    .where('internship_program_id',internship_program_id)
    .where('company_id',company_id)
    .where('is_vip',is_vip)
    .first();

    //parsing text replacement
    const keyReplacement = []
    const valueReplacement = []
    //user information
    keyReplacement.push('nama')
    valueReplacement.push(user.name)

    //competence
    const htmlString = internship.competence;
    const dom = new JSDOM(htmlString);
    // Get the list items using querySelectorAll
    const listItems:any = dom.window.document.querySelectorAll('li');
    // Iterate through the list items and extract their text content
    Array.from(listItems).map((item:any,index) => {
      keyReplacement.push(`kompetensi ${index+1}`)
      valueReplacement.push(item.textContent)
    });

    //parsing question
    if(data){
      data.section.map(section => {
        section.question.map(question => {
          for(var i = 0; i < keyReplacement.length; i++) {
              question.question = question.question.replace(new RegExp('{' + keyReplacement[i] + '}', 'gi'), valueReplacement[i]);
          }
        })
      })
    }
   

    return data;
  }


  public async detail(id:any): Promise<any> {
    const data:any = await ModelScoringQuestion.query().select()
    .from(ModelScoringQuestion.tableName)
    .whereNotDeleted()
    .where('id',id).first();

    return data;
  }

  public async detailScore(id:any): Promise<any> {
    const datafirst:any = await ModelScoring.query().from(ModelScoring.tableName).whereNotDeleted().where('id',id).first();
    if(!datafirst) throw new HttpException(409, "Fail get data");

    const data:any = await ModelScoring.query().select()
    .from(ModelScoring.tableName)
    .whereNotDeleted()
    .withGraphFetched('[master.section.question.[user_answer(user),options]]')
    .modifiers({
      user(builder) {
        builder.where('scoring_id',id);
      }
    })
    .where('id',id).first();

    //get user insternship

    const user_internship:any = await ModelUserInternship.query().withGraphFetched('[mentee,internship]').where('mentee_id',data.user_id).where('status','active').first()
    if(user_internship){
       //parsing text replacement
      const keyReplacement = []
      const valueReplacement = []
      //user information
      keyReplacement.push('nama')
      valueReplacement.push(user_internship.mentee.name)

      //competence
      const htmlString = user_internship.internship.competence;
      const dom = new JSDOM(htmlString);
      // Get the list items using querySelectorAll
      const listItems:any = dom.window.document.querySelectorAll('li');
      // Iterate through the list items and extract their text content
      Array.from(listItems).map((item:any,index) => {
        keyReplacement.push(`kompetensi ${index+1}`)
        valueReplacement.push(item.textContent)
      });

      //parsing question
      if(data){
        data.master.section.map(section => {
          section.question.map(question => {
            for(var i = 0; i < keyReplacement.length; i++) {
                question.question = question.question.replace(new RegExp('{' + keyReplacement[i] + '}', 'gi'), valueReplacement[i]);
            }
          })
        })
      }
    }

    return data;
  }

  public async create(param: any): Promise<any> {
    //create master 
    const insertMaster:any = await ModelScoringMaster.query().insert({
      id:generateId(),
      name: param.name,
      description: param.description,
      company_id: param.company_id,
      internship_program_id: param.internship_program_id,
      role_id: param.role_id,
      start_date: param.start_date,
      end_date: param.end_date,
      is_vip: param.is_vip
    }).into(ModelScoringMaster.tableName)
    if(!insertMaster) throw new HttpException(409, "Fail update data");
    
    for (let index = 0; index < param.section.length; index++) {
      const element = param.section[index];
      const insertSection:any = await ModelScoringSection.query().insert({
        id: generateId(),
        name: element.name,
        scoring_master_id: insertMaster.id
      }).into(ModelScoringSection.tableName);
      if(!insertSection) throw new HttpException(409, "Fail update data");

      for (let indexques = 0; indexques < element.questions.length; indexques++) {
        const question = element.questions[indexques];
        const insertQuestion:any = await ModelScoringQuestion.query().insert({
          id:generateId(),
          question:question.question,
          is_required: question.is_required,
          question_type:question.question_type,
          question_order:question.question_order,
          scoring_master_id: insertMaster.id,
          scoring_section_id: insertSection.id,
          internship_program_id:param.internship_program_id,
          role_id:param.role_id,
          company_id:param.company_id
        }).into(ModelScoringQuestion.tableName)
        if(!insertQuestion) throw new HttpException(409, "Fail update data");

        for (let indexopt = 0; indexopt < question.options.length; indexopt++) {
          const option = question.options[indexopt];
          const insertOption:any = await ModelScoringQuestionOption.query().insert({
            id:generateId(),
            name:option.name,
            is_true: option.is_true,
            scoring_question_id:insertQuestion.id,
          }).into(ModelScoringQuestionOption.tableName)
          if(!insertOption) throw new HttpException(409, "Fail update data");
        }
      }
    }
    return insertMaster;
  }

  public async createScore(param: any): Promise<any> {
    //check validation only can be submit on 1-25 and once per month
    // const day = parseInt(moment().format('D'));
    const month = parseInt(param.month)
    const year = param.year
    // if(param.bypass_date == undefined || param.bypass_date == false){
    //   if(day > 25) throw new HttpException(409, "Tanggal tidak boleh lebih dari tanggal 25!");
    // }

    // const score:any = await ModelScoring.query()
    // .where('created_by',param.user.id)
    // .where('user_id',param.user_id)
    // // .whereRaw(`(EXTRACT("month" from  created_at), EXTRACT("year" from created_at))=(${month},${year})`)
    // .where('month',month)
    // .where('year',year)
    // .whereNotDeleted()
    // .first();
    // if(score) throw new HttpException(409, "Sudah terdapat penilaian untuk bulan ini!");
    
    const insertScore:any = await ModelScoring.query().insert({
      id:generateId(),
      score:param.score,
      user_id: param.user_id,
      created_by: param.user.id,
      // sprint_id: param.sprint_id,
      squad_id: param.squad_id,
      internship_id: param.internship_id,
      scoring_master_id: param.scoring_master_id,
      activity_point: param.activity_point,
      activity_description: param.activity_description,
      activity_link:param.activity_link,
      month:month,
      year:year
    }).into(ModelScoring.tableName)
    if(!insertScore) throw new HttpException(409, "Fail update data");

    for (let index = 0; index < param.detail.length; index++) {
      const element = param.detail[index];
      const insertDetail:any = await ModelScoringDetail.query().insert({
        id:generateId(),
        scoring_id: insertScore.id,
        score:element.score,
        answer:element.answer,
        scoring_question_id: element.scoring_question_id
      }).into(ModelScoringDetail.tableName)
      if(!insertDetail) throw new HttpException(409, "Fail update data");
    }
    //check user
    const user:any = await ModelUser.query().where('id',param.user_id).withGraphFetched('[role]').first();
    if(user){
      if(user.role.name === 'Mentee'){
        const leaderboardService:any = new LeaderboardService;
        await leaderboardService.generateScore({
          user_id:user.id
        })
      }
    }
    return insertScore;
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelScoringMaster.query().select().from(ModelScoringMaster.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelScoringMaster.query().update({
      name:param.name,
      description:param.description,
      start_date:param.start_date,
      end_date:param.end_date,
      role_id:param.role_id,
      company_id:param.company_id,
      internship_program_id:param.internship_program_id,
      is_vip:param.is_vip
    }).where("id", "=", id).into(ModelScoringMaster.tableName);

    //update question
    const section:any = await ModelScoringSection.query().where('scoring_master_id',id).count()
    if(section){
      await ModelScoringSection.query().where('scoring_master_id',id).delete()
    }

    const question:any = await ModelScoringQuestion.query().where('scoring_master_id',id).count()
    if(question){
      await ModelScoringQuestion.query().where('scoring_master_id',id).delete()
    }

    for (let index = 0; index < param.section.length; index++) {
      const element = param.section[index];
      let dataSection:any = await ModelScoringSection.query().where('id',element.id).first();
      if(dataSection){
        dataSection = await ModelScoringSection.query()
        .where('id',element.id)
        .update({
          name:element.name,
          deleted_at: null
        }).into(ModelScoringSection.tableName)
        if(!dataSection) throw new HttpException(409, "Failed to save!");

        dataSection = await ModelScoringSection.query().where('id',element.id).first();
      }else{
        dataSection = await ModelScoringSection.query().insert({
          id: generateId(),
          name: element.name,
          scoring_master_id: id
        }).into(ModelScoringSection.tableName)
        if(!dataSection) throw new HttpException(409, "Fail update data");
      }

      for (let indexques = 0; indexques < element.questions.length; indexques++) {
        const quest = element.questions[indexques];
        let dataQuestion:any = await ModelScoringQuestion.query().where('id',quest.id).first();
        if(dataQuestion){
          dataQuestion = await ModelScoringQuestion.query()
          .where('id',quest.id)
          .update({
            question:quest.question,
            is_required: quest.is_required,
            question_type:quest.question_type,
            question_order:quest.question_order,
            deleted_at: null
          }).into(ModelScoringQuestion.tableName)
          if(!dataQuestion) throw new HttpException(409, "Failed to save!");
          const options:any = await ModelScoringQuestionOption.query().where('scoring_question_id',quest.id).count()
          if(options){
            await ModelScoringQuestionOption.query().where('scoring_question_id',quest.id).delete()
          }
          dataQuestion = await ModelScoringQuestion.query().where('id',quest.id).first();

        }else{
          dataQuestion = await ModelScoringQuestion.query().insert({
            id:generateId(),
            question:quest.question,
            is_required: quest.is_required,
            question_type:quest.question_type,
            question_order:quest.question_order,
            scoring_master_id: id,
            internship_program_id:param.internship_program_id,
            scoring_section_id: dataSection.id,
            role_id:param.role_id,
            company_id:param.company_id
          }).into(ModelScoringQuestion.tableName)
          if(!dataQuestion) throw new HttpException(409, "Fail update data");
        }

        for (let indexopt = 0; indexopt < quest.options.length; indexopt++) {
          const option = quest.options[indexopt];
          let dataQuestionOpt:any = await ModelScoringQuestionOption.query().where('id',option.id).first();
          if(dataQuestionOpt){
            dataQuestionOpt = await ModelScoringQuestionOption.query()
            .where('id',option.id)
            .update({
              name:option.name,
              is_true: option.is_true,
              deleted_at: null
            }).into(ModelScoringQuestionOption.tableName)
            if(!dataQuestionOpt) throw new HttpException(409, "Failed to save!");
          }else{
            dataQuestionOpt = await ModelScoringQuestionOption.query().insert({
              id:generateId(),
              name:option.name,
              is_true: option.is_true,
              scoring_question_id:dataQuestion.id,
            }).into(ModelScoringQuestionOption.tableName)
            if(!dataQuestion) throw new HttpException(409, "Fail update data");
          }
        }
        
      }
    }

    
    const updateData: any = await ModelScoringMaster.query().select().from(ModelScoringMaster.tableName).withGraphFetched('[section.question]').where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<Campus> {
    const data: any = await ModelScoringMaster.query().select().from(ModelScoringMaster.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelScoringMaster.query().delete().where("id", "=", id).into(ModelScoringMaster.tableName);
    return data;
  }

  public async rescore(param: any): Promise<any> {
    //check user
    const user:any = await ModelUser.query().select('id','name','email').whereIn('email',param.user).withGraphFetched('[role]');
    for (let index = 0; index < user.length; index++) {
      const element = user[index];
      //get okr task
      const okrTask:any = await ModelOkrTask.query().where('mentee_id',element.id)
      for (let indexkr = 0; indexkr < okrTask.length; indexkr++) {
        const elementKr = okrTask[indexkr];
        const sprint:any = await ModelSprint.query().where('id',elementKr.sprint_id).first();
        if(sprint){
          const sprintMaster:any = await ModelSprintMaster.query().where('id',sprint.sprint_master_id).first();
          if(sprintMaster){
            const month = moment(sprintMaster.period_start).format('M');
            const year = moment(sprintMaster.period_start).format('YYYY');
            console.log(elementKr.id,elementKr.month,elementKr.year,month,year)
            //update
            await ModelOkrTask.query().update({
              month:month,
              year:year
            }).where('id',elementKr.id).into(ModelOkrTask.tableName)
          }
        }
      }
      const leaderboardService:any = new LeaderboardService;
      await leaderboardService.generateScore({
        user_id:element.id
      })
    }
    
    return user;
  }

  public async rescoreAll(param: any): Promise<any> {
    //check user
    const leaderboard:any = await ModelLeaderboard.query().where('month',param.month).where('year',param.year)
    // console.log(param.month,param.year,leaderboard)
    let user_id = []
    await leaderboard.map(val => {
      user_id.push(val.user_id)
    })
    const user:any = await ModelUser.query().select('id','name','email').whereIn('id',user_id).withGraphFetched('[role]');
    for (let index = 0; index < user.length; index++) {
      const element = user[index];
      //get okr task
      const okrTask:any = await ModelOkrTask.query().where('mentee_id',element.id)
      for (let indexkr = 0; indexkr < okrTask.length; indexkr++) {
        const elementKr = okrTask[indexkr];
        const sprint:any = await ModelSprint.query().where('id',elementKr.sprint_id).first();
        if(sprint){
          const sprintMaster:any = await ModelSprintMaster.query().where('id',sprint.sprint_master_id).first();
          if(sprintMaster){
            const month = moment(sprintMaster.period_start).format('M');
            const year = moment(sprintMaster.period_start).format('YYYY');
            // console.log(elementKr.id,elementKr.month,elementKr.year,month,year)
            //update
            await ModelOkrTask.query().update({
              month:month,
              year:year
            }).where('id',elementKr.id).into(ModelOkrTask.tableName)
          }
        }
      }
      const leaderboardService:any = new LeaderboardService;
      await leaderboardService.generateScore({
        user_id:element.id
      })
    }
    
    return user;
  }
  
}

export default ScoringService;
