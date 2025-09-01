import { HttpException } from "@exceptions/HttpException";
import { generateId } from "@utils/util";
import { Internship } from "@/interfaces/internship.interface";
import { ModelInternship } from "@/models/internship.model";
import { User } from "@/interfaces/users.interface";
import { Users } from "@/models/users.model";
import { Company } from "@/interfaces/company.interface";
import { ModelCompany } from "@/models/company.model";
import { InternshipProgram } from "@/interfaces/internship_program.interface";
import { ModelInternshipProgram } from "@/models/internship_program.model";
import { ModelScreeningQuestion } from "@/models/screening_question.model";
import { ModelScreeningAnswer } from "@/models/screening_answer.model";
import { ModelSelfInterviewQuestion } from "@/models/self_interview_question.model";
import { ModelChallengeQuestion } from "@/models/challenge_question.model";
import { InternshipProgramId } from "@/dtos/internship.dto";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUserScreeningAnswer } from "@/models/user_screening_answer.model";
import { ModelUserSelfInterviewAnswer } from "@/models/user_self_interview_answer.model";
import { ModelUserChallengeAnswer } from "@/models/user_challenge_answer.model";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { join } from "path";
import moment from "moment";

class Internshipv2Service {
  public async get(param: any): Promise<any> {
    let internshipQuery = ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .whereNotDeleted()
        .withGraphFetched("[program,company,province,city,mentor,user_internship,batch_master]")
        .modifyGraph('user_internship',builder => {
          builder.select('id');
        });

    if(param.batch_master_id){
      internshipQuery = internshipQuery.where('batch_master_id','=',param.batch_master_id);
    }

    if(param.internship_type){
      internshipQuery = internshipQuery.where('program_id','=',InternshipProgramId[param.internship_type]);
    }
    if(param.city_id){
      internshipQuery = internshipQuery.where('city_id','=',param.city_id);
    }
    if(param.province_id){
      internshipQuery = internshipQuery.where('province_id','=',param.province_id);
    }
    if(param.search){
      internshipQuery = internshipQuery.where('name','ILIKE', '%'+param.search+'%');
    }

    if(param.is_publish){
      internshipQuery =  internshipQuery.where('is_publish','=',param.is_publish)
    }

    if(param.is_not_active){
      internshipQuery = internshipQuery.where('onboard_date','<=',moment().format('YYYY-MM-DD'))
    }else{
      internshipQuery = internshipQuery.where('onboard_date','>=',moment().format('YYYY-MM-DD'))
    }

    if(param.program_id){
      internshipQuery =  internshipQuery.where('program_id','=',param.program_id)
    }

    if(param.company_id){
      internshipQuery =  internshipQuery.where('company_id','=',param.company_id)
    }

    if(param.area){
      internshipQuery =  internshipQuery.where('area','=',param.area)
    }

    if(param.unit){
      internshipQuery =  internshipQuery.where('unit','=',param.unit)
    }

    if(param.type){
      // export const TARGET_PESERTA = [
      //   {
      //     value: 'ce845hyhg5t0awb32jp0',
      //     label: 'SMK'
      //   },
      //   { value: 'ce845hyhg5t0awb32jpg', label: 'Universitas' }
      // ];
      if(param.type === 'smk'){
        internshipQuery =  internshipQuery.where('target_peserta','=','ce845hyhg5t0awb32jp0')
      }else{
        internshipQuery =  internshipQuery.where('target_peserta','=','ce845hyhg5t0awb32jpg')
      }
    }

		const page = param.page - 1;
    const data: any = await internshipQuery.orderBy('id','desc').page(page, param.perPage);
    data.results.map(val => {
      val.jumlah_peserta = val.user_internship.length
    })
    return data;
  }

  public async create(param: any): Promise<Internship> {
    //check mentor
    const findMentor: User = await Users.query().select().from(Users.tableName).where("id", "=", param.mentor_id).first();
    if (!findMentor) throw new HttpException(404, `Mentor doesn't exist`);

    //check company
    if(param.company_id){
      const findCompany: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", param.company_id).first();
      if (!findCompany) throw new HttpException(404, `Company doesn't exist`);
    }
    
    //check internship program
    const findInternshipProgram: InternshipProgram = await ModelInternshipProgram.query()
      .select()
      .from(ModelInternshipProgram.tableName)
      .where("id", "=", param.program_id)
      .first();
    if (!findInternshipProgram) throw new HttpException(404, `Internship Program doesn't exist`);

    //screening question
    const screeningQuestion = param.screening_question 
    const selfInterviewQuestion = param.self_interview_question
    const challengeQuestion = param.challenge_question

    delete param.challenge_question 
    delete param.screening_question
    delete param.self_interview_question 

    const createData: Internship = await ModelInternship.query()
      .insert({ id: generateId(), ...param })
      .into(ModelInternship.tableName);
    if (!createData) throw new HttpException(500, `Failed to save!`);

    if(screeningQuestion){
      screeningQuestion.map(async val => {
        const insertQuestion = await ModelScreeningQuestion.query().insert({
          id: generateId(),
          internship_id: createData.id,
          question:val.question,
          is_required:val.is_required
        }).into(ModelScreeningQuestion.tableName);
        if (!insertQuestion) throw new HttpException(500, `Failed to save!`);

        //answer
        val.answer.map(async ans => {
          const insertAnswer = await ModelScreeningAnswer.query().insert({
            id: generateId(),
            internship_id: createData.id,
            screening_question_id: insertQuestion.id,
            answer: ans.answer,
            is_correct: ans.is_correct,
            score: ans.is_correct?25:0
          }).into(ModelScreeningAnswer.tableName)
          if (!insertAnswer) throw new HttpException(500, `Failed to save!`);
        })
      })
    }

    if(selfInterviewQuestion){
      selfInterviewQuestion.map(async val => {
        const insertQuestion = await ModelSelfInterviewQuestion.query().insert({
          id: generateId(),
          internship_id: createData.id,
          question:val.question,
          is_required:val.is_required,
          duration:val.duration
        }).into(ModelSelfInterviewQuestion.tableName);
        if (!insertQuestion) throw new HttpException(500, `Failed to save!`);
      })
    }

    if(challengeQuestion){
      const insertQuestion = await ModelChallengeQuestion.query().insert({
        id: generateId(),
        internship_id: createData.id,
        format:challengeQuestion.format,
        description:challengeQuestion.description
      }).into(ModelChallengeQuestion.tableName);
      if (!insertQuestion) throw new HttpException(500, `Failed to save!`);
    }
    const insertData:any = await ModelInternship.query().where('id',createData.id)
    .withGraphFetched('[screening_question.answer,self_interview_question,challenge_question]')
    .first();

    return insertData;
  }

  public async detail(id: any): Promise<any> {
    const data:any = await ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .whereNotDeleted()
        .where('id',id)
        .withGraphFetched("[program,company,province,city,screening_question.answer,self_interview_question,challenge_question,batch_master,data_unit,data_area]")
        .first();

    return data;
  }

  public async deleteMentee(id: any): Promise<any> {
    const data:any = await ModelUserInternship.query()
        .select()
        .from(ModelUserInternship.tableName)
        .whereIn('id',id)
        .delete()

    return data;
  }

  public async duplicate(id: any,param:any): Promise<any> {
    const data:any = await ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .whereNotDeleted()
        .where('id',id)
        .withGraphFetched("[program,company,province,city,screening_question.answer,self_interview_question,challenge_question,batch_master,data_unit,data_area]")
        .first();
      
    const paramInternship:any = {
      "mentor_id": data.mentor_id,
      "company_id": data.company_id,
      "program_id": data.program_id,
      "name": data.position,
      "position": data.position,
      "type":data.type,
      "province_id":data.province_id,
      "city_id":data.city_id,
      "location":data.location,
      "batch_master_id":param.batch_master_id,
      "area":data.area,
      "unit":data.unit,
      "period_start":param.period_start,
      "period_end":param.period_end,
      "registration_date":param.registration_date,
      "onboard_date":param.onboard_date,
      "quota":param.quota,
      "quota_max":param.quota_max,
      "criteria": data.criteria, //description
      "requirements":data.requirements,
      "competence":data.competence,
    };

    let screening_quest = [];
    for (let index = 0; index < data.screening_question.length; index++) {
      const element = data.screening_question[index];
      //answer
      let screening_ans = []
      element.answer.map(val => {
        screening_ans.push({
          answer: val.answer,
          is_correct: val.is_correct,
        })
      })
      
      screening_quest.push({
        question:element.question,
        is_required: element.is_required,
        answer: screening_ans
      })
    }

    let self_interview = [];
    for (let index = 0; index < data.self_interview_question.length; index++) {
      const element = data.self_interview_question[index];
      
      self_interview.push({
        question:element.question,
        is_required: element.is_required,
        duration: element.duration
      })
    }

    let challenge_question = !data.challenge_question ? null : {
      format: data.challenge_question.format,
      description: data.challenge_question.description
    };
      
    const duplicate:any = await this.create({
      ...paramInternship,
      "screening_question":screening_quest,
      "self_interview_question":self_interview,
      "challenge_question":challenge_question
    })

    return duplicate;
  }

  public async update(id:any, param: any): Promise<Internship> {
    //check mentor
    const findInternship: any = await ModelInternship.query().select().from(ModelInternship.tableName).where("id", "=", id).first();
    if (!findInternship) throw new HttpException(500, `Internhsip doesn't exist`);

    //check mentor
    const findMentor: User = await Users.query().select().from(Users.tableName).where("id", "=", param.mentor_id).first();
    if (!findMentor) throw new HttpException(500, `Mentor doesn't exist`);

    //check company
    if(param.company_id){
      const findCompany: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", param.company_id).first();
      if (!findCompany) throw new HttpException(500, `Company doesn't exist`);
    }
    
    //check internship program
    const findInternshipProgram: InternshipProgram = await ModelInternshipProgram.query()
      .select()
      .from(ModelInternshipProgram.tableName)
      .where("id", "=", param.program_id)
      .first();
    if (!findInternshipProgram) throw new HttpException(500, `Internship Program doesn't exist`);

    //screening question
    const screeningQuestion = param.screening_question 
    const selfInterviewQuestion = param.self_interview_question
    const challengeQuestion = param.challenge_question

    delete param.challenge_question 
    delete param.screening_question
    delete param.self_interview_question 

    
    const updateData:any = await ModelInternship.query()
      .where('id',id)
      .update({ ...param })
      .into(ModelInternship.tableName);
    if (!updateData) throw new HttpException(500, `Failed to save!`);

    if(screeningQuestion){
      //delete screening question
      const getScreening:any = await ModelScreeningQuestion.query().where('internship_id',id);
      const screeningId = []
      getScreening.map(val => {
        screeningId.push(val.id)
      })

      if(screeningId.length != 0){
        const deleteScreeningAnswer:any = await ModelScreeningAnswer.query().whereIn('screening_question_id',screeningId).delete()
        if (!deleteScreeningAnswer) throw new HttpException(500, `Failed to save!`);

        const deleteScreeningQuestion:any = await ModelScreeningQuestion.query().whereIn('id',screeningId).delete()
        if (!deleteScreeningQuestion) throw new HttpException(500, `Failed to save!`);
      }
      screeningQuestion.map(async val => {
        const insertQuestion = await ModelScreeningQuestion.query().insert({
          id: generateId(),
          internship_id: id,
          question:val.question,
          is_required:val.is_required
        }).into(ModelScreeningQuestion.tableName);
        if (!insertQuestion) throw new HttpException(500, `Failed to save!`);

        //answer
        val.answer.map(async ans => {
          const insertAnswer = await ModelScreeningAnswer.query().insert({
            id: generateId(),
            internship_id: id,
            screening_question_id: insertQuestion.id,
            answer: ans.answer,
            is_correct: ans.is_correct,
            score: ans.is_correct?25:0
          }).into(ModelScreeningAnswer.tableName)
          if (!insertAnswer) throw new HttpException(500, `Failed to save!`);
        })
      })
    }

    if(selfInterviewQuestion){
      //delete interview question
      const getInterview:any = await ModelSelfInterviewQuestion.query().where('internship_id',id);
      const interviewId = []
      getInterview.map(val => {
        interviewId.push(val.id)
      })
      
      if(interviewId.length != 0){
        const deleteInterview:any = await ModelSelfInterviewQuestion.query().whereIn('id',interviewId).delete()
        if (!deleteInterview) throw new HttpException(500, `Failed to save!`);
      }

      selfInterviewQuestion.map(async val => {
        const insertQuestion = await ModelSelfInterviewQuestion.query().insert({
          id: generateId(),
          internship_id: id,
          question:val.question,
          is_required:val.is_required,
          duration:val.duration
        }).into(ModelSelfInterviewQuestion.tableName);
        if (!insertQuestion) throw new HttpException(500, `Failed to save!`);
      })
    }

    if(challengeQuestion){
       //delete interview question
       const checkChallengeQuestion:any = await ModelChallengeQuestion.query().where('internship_id',id);
       const challengeId = []
       checkChallengeQuestion.map(val => {
         challengeId.push(val.id)
       })
       
       if(challengeId.length != 0){
         const deleteChallenge:any = await ModelChallengeQuestion.query().whereIn('id',challengeId).delete()
         if (!deleteChallenge) throw new HttpException(500, `Failed to save!`);
       }

      const insertQuestion = await ModelChallengeQuestion.query().insert({
        id: generateId(),
        internship_id: id,
        format:challengeQuestion.format,
        description:challengeQuestion.description
      }).into(ModelChallengeQuestion.tableName);
      if (!insertQuestion) throw new HttpException(500, `Failed to save!`);
    }
    const insertData:any = await ModelInternship.query().where('id',id)
    .withGraphFetched('[screening_question.answer,self_interview_question,challenge_question]')
    .first();

    return insertData;
  }

  public async menteeRegisterList(id: any): Promise<any> {
    const data: any = await ModelUserInternship.query()
    .select('user_internship.*')
    .leftJoin('internship','internship.id','user_internship.internship_id')
    .withGraphFetched('[internship.[program,company,challenge_question,self_interview_question],mentee,screening_answer,interview_answer,challenge_answer]')
    .where('mentee_id',id)
    .where('internship.onboard_date','>=',moment().format('YYYY-MM-DD'))
    .orderBy('id','desc');
    return data;
  }

  public async menteeRegister(param: any): Promise<Internship> {
    //check mentee
    const findMentee: User = await Users.query().select().from(Users.tableName).where("id", "=", param.mentee_id).first();
    if (!findMentee) throw new HttpException(403, `Mentee doesn't exist`);

    //check internship
    const findInternship:any = await ModelInternship.query().select().from(ModelInternship.tableName).where("id", "=", param.internship_id).first();
    if (!findInternship) throw new HttpException(403, `Internship doesn't exist`);

    //check if internship more than 2
    // const checkInternship:any = await ModelUserInternship.query().where('mentee_id',findMentee.id).count().first()
    // if(checkInternship.count == 2){
    //   throw new HttpException(403, `Tidak bisa daftar lebih dari 2 lowongan!`);
    // }

    //check if internship already registered
    const checkUserInternship:any = await ModelUserInternship.query().where('mentee_id',findMentee.id).where("internship_id",param.internship_id).first()
    if(checkUserInternship){
      throw new HttpException(403, `Internship sudah terdaftar!`);
    }

    //check internship quota
    const checkInternshipQuota:any = await ModelUserInternship.query().where("internship_id",param.internship_id).count().first()
    console.log(checkInternshipQuota.count, findInternship.quota_max)
    if(checkInternshipQuota.count >= findInternship.quota_max){
      throw new HttpException(403, `Kuota Internship sudah habis!`);
    }

    //create user internship
    const userInternship:any = await ModelUserInternship.query().insert({
      id:generateId(),
      mentee_id:param.mentee_id,
      internship_id:param.internship_id,
      review:0
    }).into(ModelUserInternship.tableName)
    if (!userInternship) throw new HttpException(403, `Failed to save`);
    
    //storing screening answer
    let total_screening_score = 0
    for (let index = 0; index < param.screening_question.length; index++) {
      const element = param.screening_question[index];
      const screeningQuestion:any = await ModelUserScreeningAnswer.query().insert({
        id:generateId(),
        user_internship_id: userInternship.id,
        user_id: param.mentee_id,
        screening_question_id: element['screening_question_id'],
        answer:element['answer'],
        score:element['score']
      }).into(ModelUserScreeningAnswer.tableName);
      if (!screeningQuestion) throw new HttpException(403, `Failed to save`);

      total_screening_score += element['score'];
    }

    let totalScreeningQuestion:any = await ModelScreeningQuestion.query().where('internship_id',param.internship_id)
    totalScreeningQuestion = totalScreeningQuestion.length * 25;

    let totalIntreviewQuestion:any = await ModelSelfInterviewQuestion.query().where('internship_id',param.internship_id)
    totalIntreviewQuestion = totalIntreviewQuestion.length * 25;

    
    const updateData:any = await ModelUserInternship.query().where('id',userInternship.id).update({
      total_screening_score:totalScreeningQuestion,
      screening_score:total_screening_score,
      total_self_interview_score:totalIntreviewQuestion,
      total_score:total_screening_score
    });
    if (!updateData) throw new HttpException(403, `Failed to save`);

    const data:any = await ModelUserInternship.query().where('id',userInternship.id).withGraphFetched('[mentee,internship.company,screening_answer]').first()
    console.log(data)
    const user = data.mentee
    const internship = data.internship
    let program = 'pkl'
    let program_name = 'Praktik Kerja Lapangan'
    let program_link = 'https://t.me/+DtHiliHD9TI0NzA9'
    if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
      program = 'kpr'
      program_name = 'Kerja Praktik'
      program_link = 'https://t.me/+w081XYVueTxhMDNl'
    }

    const emailProvider = new NodeMailerProvier();
    const fs = require("fs");
    const handlebars = require("handlebars");
    let pathview = join(process.cwd(), "/src/views/notifikasi-daftar.html");
    const source = fs.readFileSync(pathview, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: user.name,
      email: user.email,
      program: program,
      program_name: program_name,
      company_name: internship.company.name,
      posisi: internship.position,
      link:program_link,
      periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
    };

    emailProvider.send({
      email: user.email,
      subject: `Selamat Pendaftaran Program ${program_name} Anda Berhasil`,
      content: template(replacements),
    });

    return userInternship;
  }

  public async getUserInterview(param: any): Promise<any> {
    //create user internship
    const data:any = await ModelUserSelfInterviewAnswer.query()
    .where('user_internship_id',param.user_internship_id)
    return data;
  }

  public async getUserChallenge(param: any): Promise<any> {
    //create user internship
    const data:any = await ModelUserChallengeAnswer.query()
    .where('user_internship_id',param.user_internship_id)
    return data;
  }

  public async createInterview(param: any): Promise<Internship> {
    //check if internship more than 2
    const checkInternship:any = await ModelUserInternship.query().where('id',param.user_internship_id).first()
    if(!checkInternship){
      throw new HttpException(403, `Internship doesn't exist!`);
    }

    //create user internship
    const interviewUser:any = await ModelUserSelfInterviewAnswer.query().insert({
      id:generateId(),
      self_interview_question_id: param.self_interview_question_id,
      user_internship_id: param.user_internship_id,
      user_id: checkInternship.mentee_id,
      answer:param.source
    }).into(ModelUserSelfInterviewAnswer.tableName);
    if (!interviewUser) throw new HttpException(403, `Failed to save`);

    const data:any = await ModelUserInternship.query().where('id',param.user_internship_id).withGraphFetched('[interview_answer]')
    return data;
  }

  public async createChallenge(param: any): Promise<Internship> {
    //check if internship more than 2
    const checkInternship:any = await ModelUserInternship.query().where('id',param.user_internship_id).first()
    if(!checkInternship){
      throw new HttpException(403, `Internship doesn't exist!`);
    }

    //create user internship
    const challengUser:any = await ModelUserChallengeAnswer.query().insert({
      id:generateId(),
      challenge_question_id: param.challenge_question_id,
      user_internship_id: param.user_internship_id,
      user_id: checkInternship.mentee_id,
      format:param.format,
      file:param.file,
      notes:param.notes
    }).into(ModelUserChallengeAnswer.tableName);
    if (!challengUser) throw new HttpException(403, `Failed to save`);


    const data:any = await ModelUserInternship.query().where('id',param.user_internship_id).withGraphFetched('[challenge_answer]')
    return data;
  }
}

export default Internshipv2Service;
