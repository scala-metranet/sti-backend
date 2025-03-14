import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Company } from "@/interfaces/company.interface";
import { ModelCompany } from "@/models/company.model";
import { CreateCompanyDto } from "@/dtos/company.dto";

class CompanyService {
  public async findAll(): Promise<Company[]> {
    const data: Company[] = await ModelCompany.query().select().from(ModelCompany.tableName);
    return data;
  }

  public async findById(id: string): Promise<Company> {
    const data: Company = await ModelCompany.query().findById(id);
    if (!data) throw new HttpException(409, "Data doesn't exist");
    return data;
  }

  public async create(param: CreateCompanyDto): Promise<Company> {
    const createData: Company = await ModelCompany.query()
      .insert({ id: generateId(), ...param })
      .into(ModelCompany.tableName);

    return createData;
  }

  public async update(id: string, param: Company): Promise<Company> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: Company[] = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCompany.query().update(param).where("id", "=", id).into("company");

    const updateData: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<Company> {
    const data: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCompany.query().delete().where("id", "=", id).into("company");
    return data;
  }
}

export default CompanyService;
