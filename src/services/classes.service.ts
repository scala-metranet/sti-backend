import { ModelClasses } from "@/models/classes.model";
import { Roles } from "@/models/roles.model";
import { ModelUser } from "@/models/user.model";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { hash } from "argon2";
import { join } from "path";
import slugify from "slugify";

class ClassesService {
  public async get(param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelClasses.query().select()
    .from(ModelClasses.tableName)
    .withGraphFetched('[user]')
    .whereNotDeleted();
    if(param.search){
      data = data.where('name','ILIKE',"%" + param.search + "%")
    }
    data = data.orderBy('id','desc')
   
    data = await data.page(page,param.perPage);

    return data;
  }

  public async detail(id:any): Promise<any> {
    const data:any = await ModelClasses.query().select()
    .from(ModelClasses.tableName)
    .whereNotDeleted()
    .where('id',id).orWhere('slug',id).first();

    return data;
  }

  public async detailMentee(id:any,param:any): Promise<any> {
    const page = param.page - 1;
    let data:any = ModelUser.query().select()
    .from(ModelUser.tableName)
    .withGraphFetched('[classes,campus_master]')
    .where('classes_id',id)
    .whereNotDeleted();

    if (param.search) {
      data = data.where("name", "ILIKE", "%" + param.search + "%");
    }
    if(param.allData){
      data = await data.orderBy('created_at','desc')
      return {results:data}
    }else{
      data = await data.orderBy('created_at','desc').page(page,param.perPage);
      return data;
    }

  }

  public async registration(param: any): Promise<any> {
    //get role_id
    const role:any = await Roles.query().where('name','Mentee').first()
    const hashedPassword = await hash(param.email);
    const paramUser = {
      name: param.name,
      email: param.email,
      nik: param.nik,
      other_field: param.other,
      campus_master_id: param.campus_id,
      school: param.major,
      instagram: param.instagram,
      no_hp: param.no_hp,
      soft_skill: param.soft_skill,
      hard_skill: param.hard_skill,
      password: hashedPassword,
      role_id: role.id,
      classes_id: param.classes_id,
    }
    //get class
    const classes:any = await ModelClasses.query().where('id',param.classes_id).first()
    if(!classes){
      throw new HttpException(409, "Class tidak terdaftar!");
    }

    //check ktp
    const checkKtp:any = await ModelUser.query().where('classes_id',paramUser.classes_id).where('nik',param.nik).first();
    if(checkKtp){
      throw new HttpException(409, "KTP sudah terdaftar!");
    }

    const checkEmail:any = await ModelUser.query().where('classes_id',paramUser.classes_id).where('email',param.email).first();
    if(checkEmail){
      throw new HttpException(409, "Email sudah terdaftar!");
    }

    //check user
    let user:any = await ModelUser.query().where('email',param.email).first();
    if(user){
      user = await ModelUser.query().where('id',user.id).update({
        campus_master_id: param.campus_id,
        classes_id: param.classes_id,
        nik: param.nik,
        other_field: param.other,
        soft_skill: param.soft_skill,
        hard_skill: param.hard_skill,
      }).into(ModelUser.tableName)
      if(!user) throw new HttpException(409, "Fail update data");
    }else{
      user = await ModelUser.query().insert({
        id:generateId(),
        ...paramUser
      }).into(ModelUser.tableName)
      if(!user) throw new HttpException(409, "Fail update data");
    }

    //send email
    if(classes.slug === 'digistar-class'){
      const emailProvider = new NodeMailerProvier();
      const fs = require("fs");
      const handlebars = require("handlebars");
      let pathview = join(process.cwd(), "/src/views/notifikasi-digistar.html");
      const source = fs.readFileSync(pathview, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        link: '',
        name: param.name,
        email: param.email,
      };

      emailProvider.send({
        email: param.email,
        subject: "Welcome",
        content: template(replacements),
      });

      console.log('send email',emailProvider)
    }
    return user;
  }

  public async resendEmail(param: any): Promise<any> {
    if(param.email.length == 0){
      throw new HttpException(409, "Email cannot be empty!");
    }
    const paramEmail = param.email.split(',');
    const emailSent = []
    for (let index = 0; index < paramEmail.length; index++) {
      const element = paramEmail[index];
      const user:any = await ModelUser.query().where('email',element).first();
      if(user){
        const emailProvider = new NodeMailerProvier();
        const fs = require("fs");
        const handlebars = require("handlebars");
        let pathview = join(process.cwd(), "/src/views/notifikasi-digistar.html");
        const source = fs.readFileSync(pathview, "utf-8").toString();
        const template = handlebars.compile(source);
        const replacements = {
          link: '',
          name: user.name,
          email: user.email,
        };
    
        emailProvider.send({
          email: user.email,
          subject: "Welcome",
          content: template(replacements),
        });

        emailSent.push(element)
      }
    }
    return emailSent;
  }

  public async create(param: any): Promise<any> {
    //check slug
    let slug:any = slugify(param.name.toLowerCase())
    const checkSlug:any = await ModelClasses.query().select().from(ModelClasses.tableName).where("slug", "=", slug);
    if (checkSlug.length > 0) {
      slug = slug+'-'+(parseInt(checkSlug.length)+1)
    }
    param.slug = slug

    const insert:any = await ModelClasses.query().insert({
      id:generateId(),
      name:param.name,
      slug:param.slug
    }).into(ModelClasses.tableName)
    if(!insert) throw new HttpException(409, "Fail update data");

    return insert;
  }

  public async update(id: string, param: any): Promise<any> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data:any = await ModelClasses.query().select().from(ModelClasses.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    //check slug
    if(param.name){
      let slug:any = slugify(param.name.toLowerCase())
      const checkSlug:any = await ModelClasses.query().select().from(ModelClasses.tableName).where("slug", "=", slug).where('id','!=',id);
      if (checkSlug.length > 0) {
        slug = slug+'-'+(parseInt(checkSlug.length)+1)
      }
      param.slug = slug
    }
   
    await ModelClasses.query().update(param).where("id", "=", id).into(ModelClasses.tableName);

    const updateData: any = await ModelClasses.query().select().from(ModelClasses.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(id: string): Promise<any> {
    const data: any = await ModelClasses.query().select().from(ModelClasses.tableName).where("id", "=", id).first();
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelClasses.query().delete().where("id", "=", id).into(ModelClasses.tableName);
    return data;
  }
}

export default ClassesService;
