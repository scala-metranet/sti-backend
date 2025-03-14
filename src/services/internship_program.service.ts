import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { InternshipProgram } from "@/interfaces/internship_program.interface";
import { ModelInternshipProgram } from "@/models/internship_program.model";

class InternshipProgramService {
  public async findAll(): Promise<InternshipProgram[]> {
    const data: InternshipProgram[] = await ModelInternshipProgram.query()
      .select()
      .from(ModelInternshipProgram.tableName)
      .withGraphFetched("[internship]");
    return data;
  }

  public async findById(id: string): Promise<InternshipProgram> {
    const data: InternshipProgram = await ModelInternshipProgram.query().findById(id);
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: InternshipProgram): Promise<InternshipProgram> {
    const createData: InternshipProgram = await ModelInternshipProgram.query()
      .insert({ id: generateId(), ...param })
      .into(ModelInternshipProgram.tableName);

    return createData;
  }

  public async update(id: string, param: InternshipProgram): Promise<InternshipProgram> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: InternshipProgram[] = await ModelInternshipProgram.query().select().from(ModelInternshipProgram.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelInternshipProgram.query().update(param).where("id", "=", id).into("internship_program");

    const updateData: InternshipProgram = await ModelInternshipProgram.query()
      .select()
      .from(ModelInternshipProgram.tableName)
      .where("id", "=", id)
      .first();
    return updateData;
  }

  public async delete(id: string): Promise<InternshipProgram> {
    const data: InternshipProgram = await ModelInternshipProgram.query().select().from(ModelInternshipProgram.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelInternshipProgram.query().delete().where("id", "=", id).into("internship_program");
    return data;
  }
}

export default InternshipProgramService;
