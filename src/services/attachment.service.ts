import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Campus } from "@/interfaces/campus.interface";
import { ModelCampus } from "@/models/campus.model";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { ModelAttachmentTemplate } from "@/models/attachment_template.model";
import { raw } from "objection";
import { join } from "path";
import docxToPdfAxios from "docx-to-pdf-axios";
import SupabaseProvider from "@/utils/supabase";

class AttachmentService {
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

  public async getMentee(param:any): Promise<any> {
    const data:any = await ModelUserInternship.query().select()
    .from(ModelUserInternship.tableName)
    .withGraphFetched('[document]')
    .modifyGraph('document',builder => {
      builder.whereNotIn('key',['surat_rekomendasi','curriculum_vitae','transkrip_nilai','jadwal_kuliah','surat_keterangan_aktif_kuliah','personality_test','bpjs'])
    })
    .where('mentee_id',param.mentee_id)
    .where('status','active')
    .first();

    return data;
  }

  public async getMonitoring(param:any): Promise<any> {
    let qry = ModelUserInternshipDocument.query()
      .select()
      .from(ModelUserInternshipDocument.tableName)
      .whereNotIn('key',['surat_rekomendasi','curriculum_vitae','transkrip_nilai','jadwal_kuliah','surat_keterangan_aktif_kuliah','personality_test','bpjs']);
    
    if(param.status){
      qry = qry.where('status',param.status);
    }

    if(param.search){
      qry = qry.where('key','like',`%${param.search}%`);
    }

    const page = param.page - 1;

    const data:any = await qry
    .withGraphFetched('[user_internship.[mentee,internship.[mentor.company,city,province]]]')
    .page(page,param.perPage)

    return data;
  }

  public async countMonitoring(): Promise<any> {
    let qry = ModelUserInternshipDocument.query()
        .select(raw('user_internship_document.status,count(user_internship_document.id) as total'))
        .whereNotIn('key',['surat_rekomendasi','curriculum_vitae','transkrip_nilai','jadwal_kuliah','surat_keterangan_aktif_kuliah','personality_test','bpjs'])
        
    const data:any[] = await qry.groupBy("user_internship_document.status")
    return data;
  }

  public async getTemplate(param:any): Promise<any[]> {
    const page = param.page - 1;
    let qry = ModelAttachmentTemplate.query().select()
    .from(ModelAttachmentTemplate.tableName);

    const data:any = await qry.page(page,param.perPage)
    return data;
  }

  public async createTemplate(param: any): Promise<any> {
    if(param.attachment){
      for (var key in param.attachment) {
        if (param.attachment.hasOwnProperty(key)) {
          const insertBerkas:any = await ModelAttachmentTemplate.query().insert({
            id:generateId(),
            user_id:param.user_id,
            name:key,
            value:param.attachment[key]
          }).into(ModelAttachmentTemplate.tableName)
          if(!insertBerkas) throw new HttpException(409, "Fail update data");
        }
      }
    }
    return {message:true};
  }

  public async createAttachment(param: any): Promise<any> {
    const data:any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName)
    .where("id", param.user_internship_id)
    .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");
    if(param.attachment){
      for (var key in param.attachment) {
        if (param.attachment.hasOwnProperty(key)) {
          const id = param.user_internship_id;
          const insertBerkas:any = await ModelUserInternshipDocument.query().insert({
            id:generateId(),
            user_internship_id:id,
            key:key,
            value:param.attachment[key],
            status:'unverified'
          }).into(ModelUserInternshipDocument.tableName)
          if(!insertBerkas) throw new HttpException(409, "Fail update data");
        }
      }
    }
    return data;
  }

  public async update(id: string, param: Campus): Promise<Campus> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: Campus[] = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCampus.query().update(param).where("id", "=", id).into("campus");

    const updateData: Campus = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<Campus> {
    const data: any = await ModelAttachmentTemplate.query().select().from(ModelAttachmentTemplate.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelAttachmentTemplate.query().delete().where("id", "=", id).into("attachment_template");
    return data;
  }

  public async updateMonitoring(param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: any[] = await ModelUserInternshipDocument.query().select().from(ModelUserInternshipDocument.tableName).where("id", "=", param.id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelUserInternshipDocument.query().update({status:param.status,notes:param.notes}).where("id", "=", param.id).into("user_internship_document");

    const updateData:any = await ModelUserInternshipDocument.query().select().from(ModelUserInternshipDocument.tableName).where("id", "=", param.id).first();
    return updateData;
  }
}

export default AttachmentService;
