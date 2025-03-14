import { ModelCompanyVisit } from "@/models/company_visit.model";
import { ModelCompanyVisitCampus } from "@/models/company_visit_campus.model";
import { Roles } from "@/models/roles.model";
import { ModelUser } from "@/models/user.model";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { hash } from "argon2";
import slugify from "slugify";
import UserService from "./users.service";
import moment from "moment";

class CompanyVisitService {
	private userService: UserService = new UserService();

  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelCompanyVisit.query().select()
    .from(ModelCompanyVisit.tableName)
    .withGraphFetched('[campus.campus]')
    .modifyGraph('campus',builder => {
      builder.whereNull('deleted_at');
    })
    .whereNotDeleted();
    if(param.company_id){
      data = data.where('company_id',param.company_id)
    }
    data = await data.orderBy('id','desc').page(page,param.perPage);

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelCompanyVisit.query().select()
    .from(ModelCompanyVisit.tableName)
    .whereNotDeleted()
    .withGraphFetched('[campus.campus,mentee]')
    .modifyGraph('campus',builder => {
      builder.whereNull('deleted_at');
    })
    .where('id',id).orWhere('slug',id).first();

    return data;
  }

  public async detailPeserta(id:any,param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelUser.query().select()
    .from(ModelUser.tableName)
    .withGraphFetched('[company_visit,campus]')
    .where('company_visit_id',id)
    .whereNotDeleted();

    if (param.search) {
      data = data.where("name", "ILIKE", "%" + param.search + "%");
    }

    if(param.allData){
      data = await data
      return {results:data}
    }else{
      data = await data.page(page,param.perPage);
      return data;
    }

    return data;
  }

  public async createPresensi(param: any): Promise<any> {
    //get role_id
    const role:any = await Roles.query().where('name','Mentee').first()
    const hashedPassword = await hash(param.email);
		const findUser:any = await this.userService.findByEmail(param.email);
    if(findUser){
      const paramUser = {
        company_visit_id: param.company_visit_id,
        place_of_birth: param.place_of_birth,
        date_of_birth: param.date_of_birth,
        nik: param.nik,
        no_hp: param.phone,
        gender: param.gender,
        degree: param.degree,
        campus_id: param.campus_id,
        school: param.major,
        semester: param.semester,
        year:param.year,
        linkedin: param.linkedin,
        instagram: param.instagram,
        created_at: moment()
      }
      const insert:any = await ModelUser.query().where('id',findUser.id).update({
        ...paramUser
      }).into(ModelUser.tableName)
      if(!insert) throw new HttpException(409, "Fail update data");
      const data:any = await ModelUser.query().where('id',findUser.id).first()
      return data;
    }else{
      const paramUser = {
        name: param.name,
        email: param.email,
        password: hashedPassword,
        role_id: role.id,
        nik: param.nik,
        no_hp: param.phone,
        gender: param.gender,
        degree: param.degree,
        place_of_birth: param.place_of_birth,
        date_of_birth: param.date_of_birth,
        company_visit_id: param.company_visit_id,
        campus_id: param.campus_id,
        school: param.major,
        semester: param.semester,
        year:param.year,
        linkedin: param.linkedin,
        instagram: param.instagram
      }
      const insert:any = await ModelUser.query().insert({
        id:generateId(),
        ...paramUser
      }).into(ModelUser.tableName)
      if(!insert) throw new HttpException(409, "Fail update data");

      return insert;
    }
  }

  public async create(param: any): Promise<any> {
    let slug:any = slugify(param.title.toLowerCase())
    //check slug
    const checkSlug:any = await ModelCompanyVisit.query().select().from(ModelCompanyVisit.tableName).where("slug", "=", slug);
    if (checkSlug.length > 0) {
      slug = slug+'-'+(parseInt(checkSlug.length)+1)
    }

    const insert:any = await ModelCompanyVisit.query().insert({
      id:generateId(),
      type:param.type,
      title:param.title,
      description:param.description,
      date:param.date,
      poster:param.poster,
      start_time:param.start_time,
      end_time:param.end_time,
      key_access:param.key_access,
      place:param.place,
      slug:slug
    }).into(ModelCompanyVisit.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    for (let index = 0; index < param.campus_id.length; index++) {
      const element:any = param.campus_id[index];
      const paramCamp:any = {
        id:generateId(),
        company_visit_id:insert.id,
        campus_id:element
      }
      const insertCampus:any = await ModelCompanyVisitCampus.query()
      .insert(paramCamp).into(ModelCompanyVisitCampus.tableName)
      if(!insertCampus) throw new HttpException(409, "Fail update data");
    }
    return insert;
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelCompanyVisit.query().select().from(ModelCompanyVisit.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check slug
    let slug:any = slugify(param.title.toLowerCase())
    const checkSlug:any = await ModelCompanyVisit.query().select().from(ModelCompanyVisit.tableName).where("slug", "=", slug).where('id','!=',id);
    if (checkSlug.length > 0) {
      slug = slug+'-'+(parseInt(checkSlug.length)+1)
    }
    param.slug = slug

    const campus:any = param.campus_id;
    delete param.campus_id

    await ModelCompanyVisit.query().update(param).where("id", "=", id).into(ModelCompanyVisit.tableName);

    const deleteCampus:any = await ModelCompanyVisitCampus.query().delete().where('company_visit_id',id);
    // if(!deleteCampus) throw new HttpException(409, "Delete failed")
    console.log(deleteCampus)

    for (let index = 0; index < campus.length; index++) {
      const element:any = campus[index];
      const paramCamp:any = {
        id:generateId(),
        company_visit_id:id,
        campus_id:element
      }
      const insertCampus:any = await ModelCompanyVisitCampus.query()
      .insert(paramCamp).into(ModelCompanyVisitCampus.tableName)
      if(!insertCampus) throw new HttpException(409, "Fail update data");
    }

    const updateData: any = await ModelCompanyVisit.query().select().from(ModelCompanyVisit.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelCompanyVisit.query().select().from(ModelCompanyVisit.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCompanyVisit.query().delete().where("id", "=", id).into(ModelCompanyVisit.tableName);
    return data;
  }
}

export default CompanyVisitService;
