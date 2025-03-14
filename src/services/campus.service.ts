import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Campus } from "@/interfaces/campus.interface";
import { ModelCampus } from "@/models/campus.model";
import { Users } from "@/models/users.model";
import { ModelCampusMaster } from "@/models/campus_master.model";

class CampusService {
  public async findAll(param:any): Promise<any[]> {
    let data = ModelCampusMaster.query().select().from(ModelCampusMaster.tableName).orderBy('name','asc');
    if(param.company_id){
      data = data.where('company_id',param.company_id);
    }
    return data;
  }

  public async findMitra(param): Promise<any[]> {
    let data = ModelCampus.query().select()
    .withGraphFetched('[faculty.major,major]')
    .from(ModelCampus.tableName).orderBy('name','asc')
    .leftJoin('user',function(builder){
      builder.on('user.campus_id','campus.id');
      builder.onVal('user.role_id','ce08kddq0yzfb7mtskz0');
    }).whereNotNull('user.id')
    .where('is_open',true)
    .whereNotDeleted()

    if(param.type){
      data = data.where('type',param.type);
    }

    if(param.company_id){
      data = data.where('company_id',param.company_id);
    }
    
    return data;
  }

  public async findById(id: string): Promise<Campus> {
    const data: Campus = await ModelCampus.query().findById(id);
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: any): Promise<Campus> {
    //check email campus
    const findUser: Users = await Users.query()
			.select()
			.from(Users.tableName)
			.where("email", "=", param.email)
			.first();
		if (findUser) throw new HttpException(409, "This email already exists.");

    const createData: Campus = await ModelCampus.query()
      .insert({ id: generateId(), ...param })
      .into(ModelCampus.tableName);

    return createData;
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
    const data: Campus = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCampus.query().delete().where("id", "=", id).into("campus");
    return data;
  }
}

export default CampusService;
