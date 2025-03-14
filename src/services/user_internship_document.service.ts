import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Internship } from "@/interfaces/internship.interface";
import { ModelInternship } from "@/models/internship.model";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { UserInternshipDocument } from "@/interfaces/user_internship_document.interface";

class UserInternshipDocumentService {
  public async findAll(): Promise<UserInternshipDocument[]> {
    const data: UserInternshipDocument[] = await ModelUserInternshipDocument.query()
      .select("*")
      .from(ModelUserInternshipDocument.tableName)
      .withGraphFetched("[internship]");
    return data;
  }

  public async findById(id: string): Promise<UserInternshipDocument> {
    const data: UserInternshipDocument = await ModelUserInternshipDocument.query().findById(id).withGraphFetched("[internship]");
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: UserInternshipDocument): Promise<UserInternshipDocument> {
    //check internship
    const findInternship: Internship = await ModelInternship.query()
      .select()
      .from(ModelInternship.tableName)
      .where("id", "=", param.user_internship_id)
      .first();
    if (!findInternship) throw new HttpException(500, `Internship doesn't exist`);

    const createData: UserInternshipDocument = await ModelUserInternshipDocument.query()
      .insert({ id: generateId(), ...param })
      .into(ModelUserInternshipDocument.tableName);

    return createData;
  }

  public async update(id: string, param: UserInternshipDocument): Promise<UserInternshipDocument> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: UserInternshipDocument[] = await ModelUserInternshipDocument.query()
      .select()
      .from(ModelUserInternshipDocument.tableName)
      .where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check internship
    const findInternship: Internship = await ModelInternship.query()
      .select()
      .from(ModelInternship.tableName)
      .where("id", "=", param.user_internship_id)
      .first();
    if (!findInternship) throw new HttpException(500, `Internship doesn't exist`);

    await ModelUserInternshipDocument.query().update(param).where("id", "=", id).into("user_internship_document");

    const updateData: UserInternshipDocument = await ModelUserInternshipDocument.query()
      .select()
      .from(ModelUserInternshipDocument.tableName)
      .where("id", "=", id)
      .first();
    return updateData;
  }

  public async delete(id: string): Promise<UserInternshipDocument> {
    const data: UserInternshipDocument = await ModelUserInternshipDocument.query()
      .select()
      .from(ModelUserInternshipDocument.tableName)
      .where("id", "=", id)
      .first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelUserInternshipDocument.query().delete().where("id", "=", id).into("user_internship_document");
    return data;
  }
}

export default UserInternshipDocumentService;
