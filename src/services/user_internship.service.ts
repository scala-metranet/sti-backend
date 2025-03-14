import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Internship } from "@/interfaces/internship.interface";
import { ModelInternship } from "@/models/internship.model";
import { UserInternship } from "@/interfaces/user_internship.interface";
import { ModelUserInternship } from "@/models/user_internship.model";

class UserInternshipService {
  public async findAll(): Promise<UserInternship[]> {
    const data: any[] = await ModelUserInternship.query().select("*").from(ModelUserInternship.tableName).withGraphFetched("[internship]");
    return data;
  }

  public async findById(id: string): Promise<UserInternship> {
    const data: any = await ModelUserInternship.query().findById(id).withGraphFetched("[internship]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: UserInternship): Promise<UserInternship> {
    //check internship
    const findInternship: Internship = await ModelInternship.query()
      .select()
      .from(ModelInternship.tableName)
      .where("id", "=", param.internship_id)
      .first();
    if (!findInternship) throw new HttpException(500, `Internship doesn't exist`);

    const createData: any = await ModelUserInternship.query()
      .insert({ id: generateId(), ...param })
      .into(ModelUserInternship.tableName);

    return createData;
  }

  public async update(id: string, param: UserInternship): Promise<UserInternship> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: any[] = await ModelUserInternship.query().select().from(ModelUserInternship.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check internship
    const findInternship: Internship = await ModelInternship.query()
      .select()
      .from(ModelInternship.tableName)
      .where("id", "=", param.internship_id)
      .first();
    if (!findInternship) throw new HttpException(500, `Internship doesn't exist`);

    await ModelUserInternship.query().update(param).where("id", "=", id).into("user_internship");

    const updateData: any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<UserInternship> {
    const data: any = await ModelUserInternship.query().select().from(ModelUserInternship.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelUserInternship.query().delete().where("id", "=", id).into("user_internship");
    return data;
  }
}

export default UserInternshipService;
