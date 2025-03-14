import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Squad } from "@/interfaces/squad.interface";
import { ModelSquad } from "@/models/squad.model";
import { ModelUser } from "@/models/user.model";

class SquadService {
  public async findAll(): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query().select("*").from(ModelSquad.tableName).withGraphFetched("[mentee,mentor]");
    return data;
  }

  public async findById(id: string): Promise<Squad> {
    const data: Squad = await ModelSquad.query().findById(id).withGraphFetched("[mentee,mentor,sprint.okr.okr_task]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async findByMentor(id: string): Promise<Squad[]> {
    const data: Squad[] = await ModelSquad.query().select('*').from(ModelSquad.tableName).where('mentor_id','=',id)
    .whereNotDeleted()
    .withGraphFetched("[mentee.user_internship.internship,mentor,sprint.okr.okr_task]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async findByMitra(param: any): Promise<Squad[]> {

    let squadQuery:any = ModelSquad.query()
    .select('squad.id','squad.name','color','mentor_id').from(ModelSquad.tableName)
    .leftJoin('user','user.squad_id','squad.id')
    .where('user.campus_id','=',param.campus_id)
    .whereNotDeleted()
    .withGraphFetched("[mentee.user_internship.internship,mentor,sprint.okr.okr_task]")
    .groupBy('squad.id');

    if(param.mentor_id){
      squadQuery = squadQuery.where('squad.mentor_id',param.mentor_id)
    }

    if(param.search){
      squadQuery = squadQuery.where('squad.name','ILIKE', "%" + param.search + "%")
    }

    const page = param.page - 1;
    const data: any = await squadQuery.page(page, param.perPage);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    return data;
  }

  public async create(param: any): Promise<Squad> {
    const paramSquad = {
      name: param.name,
      color: param.color,
      mentor_id: param.mentor_id
    }
    const createData: Squad = await ModelSquad.query()
      .insert({ id: generateId(), ...paramSquad })
      .into(ModelSquad.tableName);
    //update user to squad
    let menteeId = []
    param.mentee_id.map(e => {
      menteeId.push(e.value)
    })
    if(menteeId.length != 0){
      const updateUser:any = await ModelUser.query()
      .update({squad_id:createData.id}).whereIn("id", menteeId).into("user");
      if (!updateUser) throw new HttpException(409, "failed");
    }
    
    return createData;
  }

  public async update(id: string, param: Squad, user: any): Promise<Squad> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelSquad.query().select().from(ModelSquad.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");
    
    if(user.role.name == 'Mentor'){
      //check eligibility Mentor
      if(user.id != data.mentor_id){
        throw new HttpException(409, "Not eligible!");
      }
    }

    await ModelSquad.query().update(param).where("id", "=", id).into("squad");

    const updateData: Squad = await ModelSquad.query().select().from(ModelSquad.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string, user: any): Promise<Squad> {
    const data: Squad = await ModelSquad.query().select().from(ModelSquad.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    if(user.role.name == 'Mentor'){
      //check eligibility Mentor
      if(user.id != data.mentor_id){
        throw new HttpException(409, "Not eligible!");
      }
    }
    
    await ModelSquad.query().delete().where("id", "=", id).into("squad");
    const updateUser:any = await ModelUser.query()
    .update({squad_id:null}).where("squad_id", id).into("user");
    if (!updateUser) throw new HttpException(409, "failed");

    return data;
  }
}

export default SquadService;
