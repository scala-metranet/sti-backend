import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { ModelJoinRequest } from "@/models/join_request.model";
import { ModelJoinRequestFeedback } from "@/models/join_request_feedback.model";

class JoinRequestService {
  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    const data:any = await ModelJoinRequest.query().select()
    .from(ModelJoinRequest.tableName)
    .whereNotNull('name')
    .whereNotDeleted()
    .orderBy('id','desc')
    .page(page,param.perPage);

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelJoinRequest.query().select()
    .from(ModelJoinRequest.tableName)
    .whereNotDeleted()
    .withGraphFetched('[feedback.user]')
    .where('id',id).first();

    return data;
  }

  public async create(param: any): Promise<any> {
    const insertBerkas:any = await ModelJoinRequest.query().insert({
      id:generateId(),
      ...param
    }).into(ModelJoinRequest.tableName)
    if(!insertBerkas) throw new HttpException(409, "Fail update data");

    return insertBerkas;
  }

  public async update(id: string, param: any, user:any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelJoinRequest.query().select().from(ModelJoinRequest.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    if(param['feedback']){
      const insertFeedback:any = await ModelJoinRequestFeedback.query().insert({
        id:generateId(),
        join_request_id:id,
        feedback:param['feedback'],
        user_id: user.id
      }).into(ModelJoinRequestFeedback.tableName)
      if(!insertFeedback) throw new HttpException(409, "Fail update data");
    }
    await ModelJoinRequest.query().update(param).where("id", "=", id).into(ModelJoinRequest.tableName);

    const updateData: any = await ModelJoinRequest.query().select().from(ModelJoinRequest.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelJoinRequest.query().select().from(ModelJoinRequest.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelJoinRequest.query().delete().where("id", "=", id).into(ModelJoinRequest.tableName);
    return data;
  }
}

export default JoinRequestService;
