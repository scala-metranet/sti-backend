import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Campus } from "@/interfaces/campus.interface";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { ModelAttachmentTemplate } from "@/models/attachment_template.model";
import { join } from "path";
import docxToPdfAxios from "docx-to-pdf-axios";
import SupabaseProvider from "@/utils/supabase";
import { ModelGraduation } from "@/models/graduation.model";
import { ModelGraduationEvent } from "@/models/graduation_event.model";
// import { raw } from "objection";
// import moment from "moment";

class GraduationService {
  public async getGraduation(param:any): Promise<any[]> {
    const page = param.page - 1;
    let qry = ModelGraduation.query()
    .from(ModelGraduation.tableName)
    .withGraphFetched('[user_internship.mentee]')

    if(param.user_internship_id){
      qry = qry.where('user_internship_id',param.user_internship_id)
    }

    if(param.status){
      if(param.status == 'all'){
        qry = qry.whereNotDeleted();
      }else{
        qry = qry.where('status',param.status);
      }
    }

    const data:any = await qry.page(page,param.perPage)
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

  public async getCurrentGraduation(param:any): Promise<any[]> {
    //get user internship
    const user:any = await ModelUserInternship.query()
    .withGraphFetched('[internship]')
    .where('mentee_id',param.id).first()
    if(!user) throw new HttpException(409, "User internship not found");

    let qry = ModelGraduation.query()
    .from(ModelGraduation.tableName)
    .withGraphFetched('[user_internship.mentee]')
    .where('user_internship_id',user.id)
    .whereNotDeleted()

    const data:any = await qry.first();
    return data;
  }

  public async getGraduationEvent(param:any): Promise<any[]> {
    const page = param.page - 1;
    let qry = ModelGraduationEvent.query()
    .from(ModelGraduationEvent.tableName)

    const data:any = await qry.page(page,param.perPage)
    return data;
  }

  public async getCurrentGraduationEvent(param:any): Promise<any[]> {
    //get user internship
    const user:any = await ModelUserInternship.query()
    .withGraphFetched('[internship]')
    .where('mentee_id',param.id)
    .where('status','active')
    .first()
    if(!user) throw new HttpException(409, "User internship not found");

    let qry = ModelGraduationEvent.query()
    .from(ModelGraduationEvent.tableName)
    .where('company_id',user.internship.company_id)
    .where('batch_master_id',user.internship.batch_master_id)
    // .where(raw('EXTRACT(MONTH FROM period_start::date)'),'>=',moment(user.internship.period_start).format('M'))
    // .where(raw('EXTRACT(MONTH FROM period_end::date)'),'<=',moment(user.internship.period_end).format('M'))

    const data:any = await qry.first();
    return data;
  }

  public async createGraduation(param: any): Promise<any> {
    //delete other graduation to make it as history
    const check:any = await ModelGraduation.query().whereNotDeleted().where('user_internship_id',param.user_internship_id);
    if(check.length){
      const deleteData:any = await ModelGraduation.query().delete().where('user_internship_id',param.user_internship_id).into(ModelGraduation.tableName);
      if(!deleteData) throw new HttpException(409, "Fail delete data");
    }

    const insert:any = await ModelGraduation.query().insert({
      id:generateId(),
      user_internship_id:param.user_internship_id,
      linkedin_url:param.linkedin_url,
      report_url:param.report_url,
      is_attend:param.is_attend,
      status:'on_review',
      reason:param.reason,
    }).into(ModelGraduation.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return {message:true};
  }

  public async createGraduationEvent(param: any): Promise<any> {
    const insert:any = await ModelGraduationEvent.query().insert({
      id:generateId(),
      ...param,
      period_start: new Date(param.date+' '+param.start_hour),
      period_end: new Date(param.date+' '+param.end_hour)
    }).into(ModelGraduationEvent.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return {message:true};
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: any[] = await ModelGraduation.query().select().from(ModelGraduation.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelGraduation.query().update(param).where("id", "=", id).into(ModelGraduation.tableName);
    
    const updateData:any = await ModelGraduation.query().select().from(ModelGraduation.tableName).where("id", "=", id).first();
    if(param.status && param.status === 'accepted'){
      //update user internship to graduate
      const updateGraduate:any = await ModelUserInternship.query().where('id',updateData.user_internship_id).update({
        status:'graduate'
      }).into(ModelUserInternship.tableName)
    if (!updateGraduate) throw new HttpException(409, "Update failed");
    }
    return updateData;
  }

  public async delete(id: string): Promise<Campus> {
    const data: any = await ModelAttachmentTemplate.query().select().from(ModelAttachmentTemplate.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelAttachmentTemplate.query().delete().where("id", "=", id).into("attachment_template");
    return data;
  }

  public async generateLetter(id:any): Promise<any> {
    //get data mentee
    const userInternship:any = await ModelUserInternship.query().from(ModelUserInternship.tableName)
      .where('id',id)
      .withGraphFetched('[mentee,internship.[company,mentor,city]]')
      .first()
    if (!userInternship) throw new HttpException(409, "Data doesn't exist");
     
    const fs = require('fs');
    const PizZip = require("pizzip");
    const Docxtemplater = require("docxtemplater");
    // Read the template file
		let pathview = join(process.cwd(), "/src/views/template_surat_1.docx");
		// let outputPath = join(process.cwd(), "/src/views/output.docx");
		let outputPdf = join(process.cwd(), "/src/views/output.pdf");

    const templateContent = fs.readFileSync(pathview, 'binary');

    // Create a document from the template
    const zip = new PizZip(templateContent);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    doc.render({
      nomor_surat: '123',
      mentee: userInternship.mentee.name,
      mentor: userInternship.internship.mentor.name,
      unit_kerja: userInternship.internship.city.name,
      bulan_awal: userInternship.internship.period_start,
      bulan_akhir: userInternship.internship.period_end
    });

    // Convert the rendered document to a buffer
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    // await fs.writeFileSync(outputPath, buffer);
    let pdfUrl = ''
    
    await docxToPdfAxios(buffer).then(async res => {
       fs.writeFileSync(outputPdf, res);
      // console.log(res)
       let supabase = new SupabaseProvider();
        const contentType: string = 'application/pdf';
        const { data, error }:any = await supabase.upload(
          `surat-penerimaan-${userInternship.mentee.name}`,
          outputPdf,
          contentType,
          `surat-penerimaan-${userInternship.mentee.name}`
        );
        if (error) throw new HttpException(409, "Upload failed");
        else pdfUrl = data.publicUrl;
    })

    const insertBerkas:any = await ModelUserInternshipDocument.query().insert({
      id:generateId(),
      user_internship_id:userInternship.id,
      key:`Surat Penerimaan`,
      value:pdfUrl,
      status:'accept'
    }).into(ModelUserInternshipDocument.tableName)
    if(!insertBerkas) throw new HttpException(409, "Fail update data");
    
    return pdfUrl
  }
}

export default GraduationService;
