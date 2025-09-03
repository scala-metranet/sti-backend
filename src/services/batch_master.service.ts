import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { ModelBatchMaster } from "@/models/batch_master.model";
import { ModelCompany } from "@/models/company.model";
import { ModelInternshipProgram } from "@/models/internship_program.model";

class BatchMasterService {
  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    const data:any = await ModelBatchMaster.query().select()
    .from(ModelBatchMaster.tableName)
    .whereNotDeleted()
    .where('company_id',param.company_id)
    .page(page,param.perPage);

    return data;
  }

  public async getFilter(param:any): Promise<any> {
    let batch:any = ModelBatchMaster.query().select()
    .from(ModelBatchMaster.tableName)
    .whereNotDeleted()
    .where('company_id',param.company_id);
    if(param.program_id){
      batch = batch.where('internship_program_id',param.program_id);
    }
    batch = await batch.orderBy('id','desc');

    const data:any = []
    for (let index = 0; index < batch.length; index++) {
      const element = batch[index];
      data.push({
        value: element.period_start+','+element.period_end,
        label: element.name,
        batch_id: element.id,
        onboard_date:element.onboard_date,
        registration_date:element.registration_date
      })
    }

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelBatchMaster.query().select()
    .from(ModelBatchMaster.tableName)
    .whereNotDeleted()
    .withGraphFetched('[sprint_master]')
    .where('id',id).first();

    return data;
  }

  public async create(param: any): Promise<any> {
    const company:any = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", param.company_id);
    if (!company) throw new HttpException(409, "Company doesn't exist");

    const internship_program = await ModelInternshipProgram
      .query()
      .select()
      .from(ModelInternshipProgram.tableName)
      .where("id", "=", param.internship_program_id)
      .first();
    if (!internship_program) throw new HttpException(404, "Internship Program doesn't exist");

    const insert:any = await ModelBatchMaster.query().insert({
      id:generateId(),
      company_id:param.company_id,
      name:param.name,
      internship_program_id:param.internship_program_id,
      period_start:param.period_start,
      period_end:param.period_end,
      onboard_date:param.onboard_date,
      registration_date:param.registration_date,
      created_by: param['user'].id
    }).into(ModelBatchMaster.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return insert;
  }

  public async update(id: string, param: any, user:any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelBatchMaster.query().select().from(ModelBatchMaster.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelBatchMaster.query().update({...param,created_by:user.id}).where("id", "=", id).into(ModelBatchMaster.tableName);

    const updateData: any = await ModelBatchMaster.query().select().from(ModelBatchMaster.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelBatchMaster.query().select().from(ModelBatchMaster.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelBatchMaster.query().delete().where("id", "=", id).into(ModelBatchMaster.tableName);
    return data;
  }
}

export default BatchMasterService;
