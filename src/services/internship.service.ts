import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Internship } from "@/interfaces/internship.interface";
import { ModelInternship } from "@/models/internship.model";
import { User } from "@/interfaces/users.interface";
import { Users } from "@/models/users.model";
import { Company } from "@/interfaces/company.interface";
import { ModelCompany } from "@/models/company.model";
import { InternshipProgram } from "@/interfaces/internship_program.interface";
import { ModelInternshipProgram } from "@/models/internship_program.model";
import { InternshipProgramId } from "@/dtos/internship.dto";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelInternshipCampus } from "@/models/internship_campus.model";
import { raw } from "objection";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { Roles } from "@/models/roles.model";
import { ModelInternshipRemapping } from "@/models/internship_remapping.model";
import AttachmentService from "./attachment.service";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { join } from "path";
import moment from "moment";
import { ModelUserSelfInterviewAnswer } from "@/models/user_self_interview_answer.model";

class InternshipService {
	public attachmentService = new AttachmentService();

  public async findAll(param:any): Promise<Internship[]> {
    let getQuery = ModelInternship.query()
    .select("*")
    .from(ModelInternship.tableName)
    .withGraphJoined("[internship_campus.user_internship,company, program]")
    if(param.province_id){
      getQuery = getQuery.where('province_id',param.province_id)
    }

    if(param.city_id){
      getQuery = getQuery.where('city_id',param.city_id)
    }

    if(param.campus_id){
      getQuery = getQuery.where('internship_campus.campus_id','=',param.campus_id)
      getQuery = getQuery.modifyGraph('internship_campus.user_internship', builder => {
        builder.join('user','user.id','user_internship.mentee_id')
        builder.where('user.campus_id',param.campus_id)
      });
    }
    
    const data: Internship[] = await getQuery
      ;
    return data;
  }

  public async findAllGroupByLocation(): Promise<Internship[]> {
    const data: Internship[] = await ModelInternship.query()
      .select("internship.province_id")
      .from(ModelInternship.tableName)
      // .where('internship.unit_id','!=',null)
      .whereNotDeleted()
      .withGraphFetched("[unit]")
      .groupBy('internship.province_id');
    return data;
  }

  public async findByMitra(param: any): Promise<any> {
    let internshipQuery = ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .leftJoin('internship_campus','internship_campus.internship_id','internship.id')
        .withGraphFetched("[internship_campus,city,province,mentor,company]")
        .orderBy('internship.id','desc')
        // .withGraphFetched("[]")
    if(!param.unassigned){
      internshipQuery = internshipQuery.where('internship_campus.campus_id','=',param.campus_id);
    }else{
      internshipQuery = internshipQuery.whereNotExists(
        ModelInternshipCampus.query()
          .select('*')
          .where('campus_id', '=', param.campus_id)
          .whereColumn('internship_campus.internship_id', 'internship.id')

      )
      // internshipQuery = internshipQuery.where('internship_campus.campus_id','=',null);
    }

    if(param.internship_type){
      internshipQuery = internshipQuery.where('program_id','=',InternshipProgramId[param.internship_type]);
    }

    if(param.search){
      internshipQuery = internshipQuery.where('name','LIKE', '%'+param.search+'%');
    }

		const page = param.page - 1;

    const data: any = await internshipQuery.page(page, param.perPage);
    return data;
  }

  public async findPublic(param: any): Promise<any> {
    let internshipQuery = ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .where('is_publish','=',true)
        .whereNotDeleted()
        .withGraphFetched("[program,company,province,city]");

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
      internshipQuery = internshipQuery.where('name','LIKE', '%'+param.search+'%');
    }

		const page = param.page - 1;
    const data: any = await internshipQuery.page(page, param.perPage);
    return data;
  }

  public async findByMentor(mentor_id: string,param: any): Promise<any> {
    let internshipQuery = ModelInternship.query()
        .select()
        .from(ModelInternship.tableName)
        .where('mentor_id','=',mentor_id)
        .whereNotDeleted()
        .withGraphFetched("[program,company,province,city,user_internship,batch_master]");

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
      internshipQuery = internshipQuery.where('name','LIKE', '%'+param.search+'%');
    }
    if(param.is_publish){
      internshipQuery = internshipQuery.where('is_publish','=',param.is_publish);
    }

		const page = param.page - 1;
    const data: any = await internshipQuery.orderBy('id','desc').page(page, param.perPage);
    data.results.map(val => {
      val.jumlah_peserta = val.user_internship.length
    })
    return data;
  }

  public async findRegistrantByMentor(mentor_id: string,param: any): Promise<any> {
    let registrantQuery = ModelUserInternship.query()
        .select('user_internship.*','user.campus_id')
        .leftJoin('internship','internship.id','=','user_internship.internship_id')
        .leftJoin('user','user.id','=','user_internship.mentee_id')
        .leftJoin('campus','user.campus_id','=','campus.id')
        .where('user.status','=','active')
        .whereNull('user.deleted_at')
        .whereNull('user_internship.deleted_at')
        .withGraphFetched("[internship.[company,data_area,data_unit,city,province,mentor],mentee.[squad,campus,province,city],schedule,session]")

    if(param.role === 'Mentor'){
      registrantQuery = registrantQuery.where('internship.mentor_id','=',mentor_id)
    }

    if(param.internship_id){
      registrantQuery = registrantQuery.where('internship.id','=',param.internship_id);
    }

    if(param.campus_id){
      registrantQuery = registrantQuery.where('user.campus_id','=',param.campus_id);
    }

    if(param.company_id){
      registrantQuery = registrantQuery.where('internship.company_id','=',param.company_id);
    }

    if(param.internship_type){
      registrantQuery = registrantQuery.where('internship.program_id','=',InternshipProgramId[param.internship_type]);
    }

    if(param.status){
      registrantQuery = registrantQuery.where('user_internship.status','=',param.status);
    }

    if(param.user_type){
      registrantQuery = registrantQuery.where('campus.type','=',param.user_type);
    }

    if(param.batch_master_id){
      registrantQuery = registrantQuery.where('internship.batch_master_id','=',param.batch_master_id);
    }

    if(param.search){
      registrantQuery = registrantQuery.where(builder => {
        builder.where(raw('LOWER(??)', ['user.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
        builder.orWhere(raw('LOWER(??)', ['internship.name']),'LIKE', '%'+param.search.toLowerCase()+'%');
      });
    }

		const page = param.page - 1;
    const data: any = await registrantQuery.orderBy('total_score','desc').page(page, param.perPage);
    return data;
  }

  public async getRegistrantDetail(id: string): Promise<any> {
    const data: any = await ModelUserInternship.query()
    .withGraphFetched(`[internship.[program,company,data_area,data_unit],
    mentee.[campus,province,city,residence_province,residence_city,working_experience,organization_experience,certificate,place_of_birth_data],
    screening_answer.question,
    interview_answer.question,
    challenge_answer.question]`)
    .where('id',id).first();
        
    return data;
  }

  public async countRegistrantByMentor(mentor_id: string,param:any): Promise<any> {
    let qry = ModelUserInternship.query()
        .select(raw('user_internship.status,count(user_internship.id) as total'))
        .leftJoin('internship','internship.id','=','user_internship.internship_id')
        .leftJoin('user','user.id','=','user_internship.mentee_id')
        .where('user.status','=','active')
        .whereNull('user.deleted_at')
    
    qry = qry.where('internship.mentor_id','=',mentor_id)

    if(param.internship_type){
      qry = qry.where('internship.program_id','=',InternshipProgramId[param.internship_type])
    }

    if(param.internship_id){
      qry = qry.where('internship_id','=',param.internship_id)
    }
        
    const data:any[] = await qry.groupBy("user_internship.status")
    return data;
  }

  public async createInterview(param: any): Promise<any> {
    //check count mentor
    const mentorInSession:any = await ModelUserInternship.query()
    .select(raw('count(user_internship.id) as count'))
    .from(ModelUserInternship.tableName)
    .where('schedule_session_id',param.schedule_session_id)
    .groupBy('interviewer_id')
    .first()
    if(mentorInSession){
      if(mentorInSession.count > 3){
        throw new HttpException(409, "Melebihi kapasitas!");
      }
    }
  
    const dataReturn:any = []
    for (let index = 0; index < param.user_internship_id.length; index++) {
      const user_internship_id = param.user_internship_id[index];
      const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
        .where("id", "=", user_internship_id)
        .first();
        if (!data) throw new HttpException(409, "Data doesn't exist");

        await ModelUserInternship.query().update({
          interviewer_id:param.interviewer_id,
          schedule_id:param.schedule_id,
          schedule_session_id:param.schedule_session_id,
          status:'interview'
        })
        .where("id", "=", user_internship_id)
        .into("user_internship");

        dataReturn.push(data)
    }
      
    return dataReturn;
  }

  public async updateApplicantStatus(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .where("id", "=", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    if(param.status === 'selected'){
      //check if applicant already confirm by other
      const checkConfirm:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
      .leftJoin('internship','internship.id','=','user_internship.internship_id')
      .where("mentee_id", "=", data.mentee_id)
      // .where('internship.batch_master_id',data.internship.batch_master_id)
      .where('status','selected')
      .first(); 
      if (checkConfirm) throw new HttpException(409, "Mentee telah diterima oleh mentor lainnya!");
    }

    await ModelUserInternship.query()
    .where("id", "=", param.user_internship_id)
    .update({
      status:param.status
    })
    .into("user_internship");

    // if(param.status === 'active'){
    //   if(data.mentee){
    //     const user = data.mentee
    //     const internship = data.internship
    //     let program = 'pkl'
    //     let program_name = 'Praktik Kerja Lapangan'
    //     let program_link = 'https://t.me/+DtHiliHD9TI0NzA9'
    //     if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
    //       program = 'kpr'
    //       program_name = 'Kerja Praktik'
    //       program_link = 'https://t.me/+w081XYVueTxhMDNl'
    //     }

    //     const emailProvider = new NodeMailerProvier();
    //     const fs = require("fs");
    //     const handlebars = require("handlebars");
    //     let pathview = join(process.cwd(), "/src/views/notifikasi-status.html");
    //     const source = fs.readFileSync(pathview, "utf-8").toString();
    //     const template = handlebars.compile(source);
    //     const replacements = {
    //       name: user.name,
    //       email: user.email,
    //       program: program,
    //       program_name: program_name,
    //       company_name: internship.company.name,
    //       posisi: internship.position,
    //       link:program_link,
    //       periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
    //       expired: moment().add(1,'day').locale('id').format('DD MMMM YYYY')
    //     };
  
    //     emailProvider.send({
    //       email: user.email,
    //       subject: `Pengumuman ${program_name}`,
    //       content: template(replacements),
    //     });
    //   }
    // }else if(param.status === 'reject'){
    //   if(data.mentee){
    //     const user = data.mentee
    //     const internship = data.internship
    //     let program = 'pkl'
    //     let program_name = 'Praktik Kerja Lapangan'
    //     if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
    //       program = 'kpr'
    //       program_name = 'Kerja Praktik'
    //     }
    //     const emailProvider = new NodeMailerProvier();
    //     const fs = require("fs");
    //     const handlebars = require("handlebars");
    //     let pathview = join(process.cwd(), "/src/views/notifikasi-status-reject.html");
    //     const source = fs.readFileSync(pathview, "utf-8").toString();
    //     const template = handlebars.compile(source);
    //     const replacements = {
    //       name: user.name,
    //       email: user.email,
    //       program: program,
    //       program_name: program_name,
    //       company_name: internship.company.name,
    //     };
  
    //     emailProvider.send({
    //       email: user.email,
    //       subject: `Pengumuman ${program_name}`,
    //       content: template(replacements),
    //     });
    //   }
      
    // }

    return data;
  }

  public async resendNotif(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .where("id", "=", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    if(data.status === 'active'){
      // await this.attachmentService.generateLetter(param.user_internship_id)
      if(data.mentee){
        const user = data.mentee
        const internship = data.internship
        //parse program
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
        let pathview = join(process.cwd(), "/src/views/notifikasi-status.html");
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
          expired: moment().add(1,'day').locale('id').format('DD MMMM YYYY')
        };
  
        emailProvider.send({
          email: user.email,
          subject: `Pengumuman ${program_name}`,
          content: template(replacements),
        });
      }
      
    }else if(data.status === 'reject'){
      // await this.attachmentService.generateLetter(param.user_internship_id)
      if(data.mentee){
        const user = data.mentee
        const internship = data.internship
        //parse program
        let program = 'pkl'
        let program_name = 'Praktek Kerja Lapangan'
        if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
          program = 'kpr'
          program_name = 'Kerja Praktik'
        }
        const emailProvider = new NodeMailerProvier();
        const fs = require("fs");
        const handlebars = require("handlebars");
        let pathview = join(process.cwd(), "/src/views/notifikasi-status-reject.html");
        const source = fs.readFileSync(pathview, "utf-8").toString();
        const template = handlebars.compile(source);
        const replacements = {
          name: user.name,
          email: user.email,
          program: program,
          program_name: program_name,
          company_name: internship.company.name,
          posisi: internship.position,
          periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
        };
  
        emailProvider.send({
          email: user.email,
          subject: `Pengumuman ${program_name}`,
          content: template(replacements),
        });
      }
      
    }

    return data;
  }

  public async bulkSendNotif(param: any): Promise<any> {
    const dataUser:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .whereIn("id", param.user_internship_id)

    for (let index = 0; index < dataUser.length; index++) {
      const data = dataUser[index];
      if(data.status === 'active'){
        // await this.attachmentService.generateLetter(param.user_internship_id)
        if(data.mentee){
          const user = data.mentee
          const internship = data.internship
          //parse program
          let program = 'pkl'
          let program_name = 'Praktik Kerja Lapangan'
          let program_link = 'https://t.me/+oKIKXkSN2kZlODI1'
          if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
            program = 'kpr'
            program_name = 'Kerja Praktik'
            program_link = 'https://t.me/+w081XYVueTxhMDNl'
          }
  
          const emailProvider = new NodeMailerProvier();
          const fs = require("fs");
          const handlebars = require("handlebars");
          let pathview = join(process.cwd(), "/src/views/notifikasi-status.html");
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
            // expired: moment().add(1,'day').locale('id').format('DD MMMM YYYY')
            expired: '29 November 2023'
          };
    
          emailProvider.send({
            email: user.email,
            subject: `Pengumuman ${program_name}`,
            content: template(replacements),
          });
        }
        
      }else if(data.status === 'reject'){
        // await this.attachmentService.generateLetter(param.user_internship_id)
        if(data.mentee){
          const user = data.mentee
          const internship = data.internship
          //parse program
          let program = 'pkl'
          let program_name = 'Praktek Kerja Lapangan'
          if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
            program = 'kpr'
            program_name = 'Kerja Praktik'
          }
          const emailProvider = new NodeMailerProvier();
          const fs = require("fs");
          const handlebars = require("handlebars");
          let pathview = join(process.cwd(), "/src/views/notifikasi-status-reject.html");
          const source = fs.readFileSync(pathview, "utf-8").toString();
          const template = handlebars.compile(source);
          const replacements = {
            name: user.name,
            email: user.email,
            program: program,
            program_name: program_name,
            company_name: internship.company.name,
            posisi: internship.position,
            periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
          };
    
          emailProvider.send({
            email: user.email,
            subject: `Pengumuman ${program_name}`,
            content: template(replacements),
          });
        }
        
      }
    }

    return dataUser;
  }

  public async confirmMentee(param: any): Promise<any> {
    const menteeList:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .whereIn("id", param.user_internship_id)
    if(menteeList.length == 0){
      throw new HttpException(409, "Data doesn't exist");
    }

    await ModelUserInternship.query()
    .whereIn("id", param.user_internship_id)
    .update({
      status: param.status
    })

    const list:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .whereIn("id", param.user_internship_id)

    for (let index = 0; index < list.length; index++) {
      const data = list[index];
      if(data.status === 'confirm'){
        // await this.attachmentService.generateLetter(param.user_internship_id)
        if(data.mentee){
          const user = data.mentee
          const internship = data.internship
          //parse program
          let program = 'pkl'
          let program_name = 'Praktik Kerja Lapangan'
          let program_link = 'https://t.me/+oKIKXkSN2kZlODI1'
          if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
            program = 'kpr'
            program_name = 'Kerja Praktik'
            program_link = 'https://t.me/+w081XYVueTxhMDNl'
          }
  
          const emailProvider = new NodeMailerProvier();
          const fs = require("fs");
          const handlebars = require("handlebars");
          let pathview = join(process.cwd(), "/src/views/notifikasi-status.html");
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
            // expired: moment().add(1,'day').locale('id').format('DD MMMM YYYY')
            expired: '29 November 2023'
          };
    
          emailProvider.send({
            email: user.email,
            subject: `Pengumuman ${program_name}`,
            content: template(replacements),
          });
        }
        
      }else if(data.status === 'reject'){
        // await this.attachmentService.generateLetter(param.user_internship_id)
        if(data.mentee){
          const user = data.mentee
          const internship = data.internship
          //parse program
          let program = 'pkl'
          let program_name = 'Praktek Kerja Lapangan'
          if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
            program = 'kpr'
            program_name = 'Kerja Praktik'
          }
          const emailProvider = new NodeMailerProvier();
          const fs = require("fs");
          const handlebars = require("handlebars");
          let pathview = join(process.cwd(), "/src/views/notifikasi-status-reject.html");
          const source = fs.readFileSync(pathview, "utf-8").toString();
          const template = handlebars.compile(source);
          const replacements = {
            name: user.name,
            email: user.email,
            program: program,
            program_name: program_name,
            company_name: internship.company.name,
            posisi: internship.position,
            periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
          };
    
          emailProvider.send({
            email: user.email,
            subject: `Pengumuman ${program_name}`,
            content: template(replacements),
          });
        }
        
      }
    }

    return list;
  }

  public async getRemapping(id: any): Promise<any> {
    const data:any = await ModelInternshipRemapping.query().select().from(ModelInternshipRemapping.tableName)
    .where("user_internship_id", "=", id)
    .withGraphFetched('[mentee.mentee,old_internship,new_internship]');

    return data;
  }

  public async remapping(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .where("id", "=", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "User Internship doesn't exist");
    const old_internship_id = data.internship_id
    const new_internship:any = await ModelInternship.query().select().from(ModelInternship.tableName)
    .where("id", "=", param.internship_id)
    .first();
    if (!new_internship) throw new HttpException(409, "Internship Data doesn't exist");

    await ModelUserInternship.query().update({
      internship_id:param.internship_id
    })
    .where("id", "=", param.user_internship_id)
    .into("user_internship");

    //create remapping log
    const insertLog:any = await ModelInternshipRemapping.query().insert({
      id:generateId(),
      user_internship_id:param.user_internship_id,
      user_id:param.user_id,
      old_internship_id:old_internship_id,
      new_internship_id:param.internship_id,
      notes:param.notes
    }).into(ModelInternshipRemapping.tableName)
    if(!insertLog) throw new HttpException(409, "Fail update data");

    return data;
  }

  public async updateApplicantStatusMou(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .withGraphFetched('[mentee,internship.company]')
    .whereIn("id", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelUserInternship.query().update({
      status:param.status
    })
    .whereIn("id", param.user_internship_id)
    .into("user_internship");

    if(param.status === 'active'){
      // await this.attachmentService.generateLetter(param.user_internship_id)
      // if(data.mentee){
      //   const user = data.mentee
      //   const internship = data.internship

      //   let program = 'pkl'
      //   let program_name = 'Praktik Kerja Lapangan'
      //   let program_link = 'https://bit.ly/GrupTelePKL_Batch3'
      //   if(data.internship.program_id == 'ce845hyhg5t0awb32jpg'){
      //     program = 'kpr'
      //     program_name = 'Kerja Praktik'
      //     program_link = 'https://t.me/+w081XYVueTxhMDNl'
      //   }

      //   const emailProvider = new NodeMailerProvier();
      //   const fs = require("fs");
      //   const handlebars = require("handlebars");
      //   let pathview = join(process.cwd(), "/src/views/notifikasi-status.html");
      //   const source = fs.readFileSync(pathview, "utf-8").toString();
      //   const template = handlebars.compile(source);
      //   const replacements = {
      //     name: user.name,
      //     email: user.email,
      //     program: program,
      //     program_name: program_name,
      //     company_name: internship.company.name,
      //     posisi: internship.position,
      //     link:program_link,
      //     periode: moment(internship.period_start).locale('id').format('DD MMMM YYYY')+' - '+moment(internship.period_end).locale('id').format('DD MMMM YYYY'),
      //     expired: moment().add(1,'day').locale('id').format('DD MMMM YYYY')
      //   };
  
      //   emailProvider.send({
      //     email: user.email,
      //     subject: `Pengumuman ${program_name}`,
      //     content: template(replacements),
      //   });
      // }
    }
    
    if(param.attachment){
      if(param.attachment.mou){
        for (let index = 0; index < param.user_internship_id.length; index++) {
          const id = param.user_internship_id[index];
          const insertBerkas:any = await ModelUserInternshipDocument.query().insert({
            id:generateId(),
            user_internship_id:id,
            key:'mou',
            value:param.attachment.mou
          }).into(ModelUserInternshipDocument.tableName)
          if(!insertBerkas) throw new HttpException(409, "Fail update data");
        }
      }
    }
    return data;
  }

  public async createAttachment(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .where("id", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelUserInternship.query().update({
      status:param.status
    })
    .whereIn("id", param.user_internship_id)
    .into("user_internship");
    
    if(param.attachment){
      for (var key in param.attachment) {
        if (param.attachment.hasOwnProperty(key)) {
          const id = param.user_internship_id;
          const insertBerkas:any = await ModelUserInternshipDocument.query().insert({
            id:generateId(),
            user_internship_id:id,
            key:key,
            value:param.attachment[key]
          }).into(ModelUserInternshipDocument.tableName)
          if(!insertBerkas) throw new HttpException(409, "Fail update data");
        }
      }
    }
    return data;
  }

  public async findById(id: string): Promise<Internship> {
    const data: Internship = await ModelInternship.query().findById(id).withGraphFetched("[company, program]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: any): Promise<Internship> {
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

    const createData: Internship = await ModelInternship.query()
      .insert({ id: generateId(), ...param })
      .into(ModelInternship.tableName);

    return createData;
  }

  public async assign(param: any): Promise<any> {
    const createData:any = await ModelInternshipCampus.query()
      .insert({ id: generateId(), ...param })
      .into(ModelInternshipCampus.tableName);

    return createData;
  }

  public async unAssign(param: any): Promise<any> {
    const data:any = await ModelInternshipCampus.query().select().from(ModelInternshipCampus.tableName)
    .where("campus_id", "=", param.campus_id)
    .where('internship_id','=',param.internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelInternshipCampus.query().delete()
    .where("campus_id", "=", param.campus_id)
    .where('internship_id','=',param.internship_id)
    .into("internship_campus");
    return data;
  }

  public async updateQuota(param: any): Promise<any> {
    const data:any = await ModelInternshipCampus.query().select().from(ModelInternshipCampus.tableName)
    .where("campus_id", "=", param.campus_id)
    .where('internship_id','=',param.internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelInternshipCampus.query().update({quota:param.quota})
    .where("campus_id", "=", param.campus_id)
    .where('internship_id','=',param.internship_id)
    .into("internship_campus");
    return data;
  }

  public async update(id: string, param: Internship, user:any): Promise<Internship> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: Internship = await ModelInternship.query().select().from(ModelInternship.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check eligible
    if(user.role.name === 'Mentor'){
      if(user.id != data.mentor_id){
        throw new HttpException(409, "Not Eligible!");
      }
    }

    //check mentor
    if(param.mentor_id){
      const findMentor: User = await Users.query().select().from(Users.tableName).where("id", "=", param.mentor_id).first();
      if (!findMentor) throw new HttpException(500, `Mentor doesn't exist`);
    }
    

    //check company
    if(param.company_id){
      const findCompany: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", param.company_id).first();
      if (!findCompany) throw new HttpException(500, `Company doesn't exist`);
    }

    //check internship program
    if(param.program_id){
      const findInternshipProgram: InternshipProgram = await ModelInternshipProgram.query()
        .select()
        .from(ModelInternshipProgram.tableName)
        .where("id", "=", param.program_id)
        .first();
      if (!findInternshipProgram) throw new HttpException(500, `Internship Program doesn't exist`);
    }

    await ModelInternship.query().update(param).where("id", "=", id).into("internship");

    const updateData: Internship = await ModelInternship.query().select().from(ModelInternship.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string, user:any): Promise<Internship> {
    const data: Internship = await ModelInternship.query().select().from(ModelInternship.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check eligible
    if(user.role.name === 'Mentor'){
      if(user.id != data.mentor_id){
        throw new HttpException(409, "Not Eligible!");
      }
    }

    await ModelInternship.query().delete().where("id", "=", id).into("internship");
    return data;
  }

  //filter
  public async getFilterInternship(param: any): Promise<any> {
    let internshipQuery = ModelInternship.query()
        .select('id','position as name')
        .from(ModelInternship.tableName)
        .whereNotDeleted();

    if(param.internship_type){
      internshipQuery = internshipQuery.where('program_id','=',InternshipProgramId[param.internship_type]);
    }

    if(param.mentor_id){
      internshipQuery = internshipQuery.where('mentor_id','=',param.mentor_id);
    }
    const data: any = await internshipQuery;
    return data;
  }

  public async getFilterCompany(): Promise<any> {
    let internshipQuery = ModelCompany.query()
        .select('id','name')
        .from(ModelCompany.tableName);
    const data: any = await internshipQuery;
    return data;
  }

  public async getFilterMentor(): Promise<any> {
    let internshipQuery = Users.query()
        .select('user.id','user.name')
        .join(Roles.tableName, "role.id", Users.selectRoleId)
        .from(Users.tableName)
        .where('role.name','Mentor')
        .whereNotDeleted();

    const data: any = await internshipQuery;
    return data;
  }

  public async getFilterMitra(): Promise<any> {
    let internshipQuery = Users.query()
      .select('user.campus_id as id','user.name')
      .join(Roles.tableName, "role.id", Users.selectRoleId)
      .from(Users.tableName)
      .where('role.name','Super Admin')
      .whereNotNull('campus_id')
      .whereNotDeleted();

    const data: any = await internshipQuery;
    return data;
  }

  public async updateApplicantInterview(param: any): Promise<any> {
    console.log(param)
    for (let index = 0; index < param.score.length; index++) {
      const element = param.score[index];
      console.log(element)
      await ModelUserSelfInterviewAnswer.query()
      .where("id", "=", element.interview_answer_id)
      .update({score:element.score})
      .into(ModelUserSelfInterviewAnswer.tableName)
    }

    //count total score interview
    const userInternship:any = await ModelUserInternship.query().where('id',param.user_internship_id).first()
    const interview:any = await ModelUserSelfInterviewAnswer.query().where('user_internship_id',param.user_internship_id);
    let score = 0
    let total_score = 0
    interview.map(val => {
      score += val.score
    })
    total_score = score + userInternship.screening_score + userInternship.challenge_score

    await ModelUserInternship.query().where('id',param.user_internship_id).update({
      self_interview_score:score,
      total_score: total_score
    })
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .where("id", "=", param.user_internship_id)
    .withGraphFetched('[interview_answer]')
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    return data;
  }

  public async updateApplicantChallenge(param: any): Promise<any> {
    // await ModelUserChallengeAnswer.query().update({score:param.score})
    // .where("id", "=", param.challenge_answer_id).into(ModelUserChallengeAnswer.tableName)

    //count total score interview
    const userInternship:any = await ModelUserInternship.query().where('id',param.user_internship_id).first()
    let total_score = 0
    total_score = param.score + userInternship.screening_score + userInternship.self_interview_score

    await ModelUserInternship.query().where('id',param.user_internship_id).update({
      challenge_score:param.score,
      total_score:total_score
    })

    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .where("id", "=", param.user_internship_id)
    .withGraphFetched('[interview_answer]')
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    return data;
  }
}

export default InternshipService;
