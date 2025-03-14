import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { ModelCompany } from "@/models/company.model";
import { ModelSprintMaster } from "@/models/sprint_master.model";
import { ModelUserInternship } from "@/models/user_internship.model";
// import { ModelBatchMaster } from "@/models/batch_master.model";
// import moment from "moment";

class SprintMasterService {
  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelSprintMaster.query().select()
    .from(ModelSprintMaster.tableName)
    .whereNotDeleted()

    if(param.batch_master_id){
      data = data.where('batch_master_id',param.batch_master_id)
    }
    if(param.current){
      if(param.user.role.name === 'Mentee'){
        const userInternship:any = await ModelUserInternship.query().withGraphFetched('[internship]').where('mentee_id',param.user.id).where('status','active').first();
        if(userInternship){
          console.log(userInternship)
          data = data.where('batch_master_id',userInternship.internship.batch_master_id)
          data = await data.page(page,param.perPage);
        }else{
          data = {results:[]}
        }
      }else if(param.user.role.name === 'Mentor'){
        const userInternship:any = await ModelUserInternship.query().withGraphFetched('[internship]').where('mentee_id',param.mentee_id).where('status','active').first();
        if(userInternship){
          // console.log(userInternship)
          data = data.where('batch_master_id',userInternship.internship.batch_master_id)
          data = await data.page(page,param.perPage);
        }else{
          data = {results:[]}
        }
        // const batch:any = await ModelBatchMaster.query().where('company_id',param.user.company_id)
        // // .where('period_start','<=',moment().format('YYYY-MM-DD'))
        // // .where('period_end','>=',moment().format('YYYY-MM-DD'))
        // .whereNotDeleted()
        // .first()
        // if(batch){
        //   data = data.where('batch_master_id',batch.id)
        //   data = await data.page(page,param.perPage);
        // }else{
        //   data = {results:[]}
        // }
      }else{
          data = {results:[]}
      }
     
      return data;
    }
    data = await data.page(page,param.perPage);

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelSprintMaster.query().select()
    .from(ModelSprintMaster.tableName)
    .whereNotDeleted()
    .withGraphFetched('[sprint_master]')
    .where('id',id).first();

    return data;
  }

  public async create(param: any): Promise<any> {
    const company:any = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", param.company_id);
    if (!company) throw new HttpException(409, "Company doesn't exist");

    const insert:any = await ModelSprintMaster.query().insert({
      id:generateId(),
      company_id:param.company_id,
      batch_master_id:param.batch_master_id,
      period_start:param.period_start,
      period_end:param.period_end,
      created_by: param['user'].id
    }).into(ModelSprintMaster.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return insert;
  }

  public async update(id: string, param: any, user:any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelSprintMaster.query().select().from(ModelSprintMaster.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelSprintMaster.query().update({...param,created_by:user.id}).where("id", "=", id).into(ModelSprintMaster.tableName);

    const updateData: any = await ModelSprintMaster.query().select().from(ModelSprintMaster.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelSprintMaster.query().select().from(ModelSprintMaster.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelSprintMaster.query().delete().where("id", "=", id).into(ModelSprintMaster.tableName);
    return data;
  }
}

export default SprintMasterService;
