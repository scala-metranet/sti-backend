import { hash } from "argon2";
import { UserStatus } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { User } from "@interfaces/users.interface";
import { Users } from "@models/users.model";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Role } from "@/interfaces/roles.interface";
import { Roles } from "@/models/roles.model";
import { Campus } from "@/interfaces/campus.interface";
import { ModelCampus } from "@/models/campus.model";
import { NodeMailerProvier } from "@/utils/emailProvider";
import { ModelUserInternship } from "@/models/user_internship.model";
import { ModelUserInternshipDocument } from "@/models/user_internship_document.model";
import { join } from "path";
import { isArray } from "class-validator";
import { raw } from "objection";
import { ModelUserWorkingExperience } from "@/models/user_working_experience.model";
import { ModelUserOrganizationExperience } from "@/models/user_organization_experience.model";
import { ModelUserCertification } from "@/models/user_certification.model";
class UserService {
  public async findAllUser(param: any): Promise<any> {
    let userQuery = Users.query()
      .select()
      .from(Users.tableName)
      .join(Roles.tableName, "role.id", Users.selectRoleId)
      .orderBy("id", "desc")
      .whereNotDeleted()
      .withGraphFetched("[role,campus]");

    

    if (param.role === "Super Admin") {
      userQuery = userQuery.where("role.name", "=", param.role);
      userQuery = userQuery.where("user.campus_id", "!=", 0);
      userQuery = userQuery.withGraphFetched("[campus.internship]");
      userQuery = userQuery.modifyGraph('campus',(builder) => {
        builder.select(raw('count("user"."id") as total_mentee'),'campus.name','campus.type','campus.phone','campus.pic','campus.pic_position','campus.email')
        builder.leftJoin('user','user.campus_id','campus.id')
        builder.groupBy('campus.id')
      })
    }

    if (param.role === "Mentor Levelup") {
      userQuery = userQuery.where("role.name", "=", "Mentor");
      userQuery = userQuery.withGraphFetched("[company]");
      userQuery = userQuery.whereNull("speaker_id")
    }

    if (param.role === "Mentor Speaker") {
      userQuery = userQuery.where("role.name", "=", "Mentor");
      userQuery = userQuery.withGraphFetched("[company]");
      userQuery = userQuery.whereNotNull("speaker_id")
    }

    if (param.role === "Mentee Universitas") {
      userQuery = userQuery.where("role.name", "=", "Mentee");
      userQuery = userQuery.whereNotExists(
        ModelCampus.query()
          .where('type','smk')
          .whereColumn('campus.id','user.campus_id')
          .whereNull('deleted_at')
      )
      userQuery = userQuery.withGraphFetched("[user_internship.[internship.[mentor,city,province],document],campus]");
    }

    if (param.role === "Mentee SMK") {
      userQuery = userQuery.where("role.name", "=", "Mentee");
      userQuery = userQuery.whereNotExists(
        ModelCampus.query()
          .where('type','universitas')
          .whereColumn('campus.id','user.campus_id')
          .whereNull('deleted_at')
      )
      userQuery = userQuery.withGraphFetched("[user_internship.[internship.[mentor,city,province],document],campus]");
    }

    if (param.role === "mentee") {
      userQuery = userQuery.where("role.name", "=", "Mentee");
      userQuery = userQuery.withGraphFetched("[user_internship.[internship.[mentor,city,province],document],campus]");
    }

    if (param.campus_id) {
      userQuery = userQuery.where("user.campus_id", "=", param.campus_id);
    }

    if (param.company_id) {
      userQuery = userQuery.where("user.company_id", "=", param.company_id);
    }

    if (param.company_area_id) {
      userQuery = userQuery.where("user.company_area_id", "=", param.company_area_id);
    }

    if (param.company_unit_id) {
      userQuery = userQuery.where("user.company_unit_id", "=", param.company_unit_id);
    }

    if(param.status) {
      userQuery = userQuery.where("user.status", "=", param.status);
    }

    if(param.campus_faculty_id) {
      userQuery = userQuery.where("user.campus_faculty_id", "=", param.campus_faculty_id);
    }

    if(param.campus_major_id) {
      userQuery = userQuery.where("user.campus_major_id", "=", param.campus_major_id);
    }

    if(param.degree) {
      userQuery = userQuery.where("user.degree", "=", param.degree);
    }

    if (param.search) {
      userQuery = userQuery.where("user.name", "ILIKE", "%" + param.search + "%");
    }

    const page = param.page - 1;

    const users: any = await userQuery.page(page, param.perPage);
    return users;
  }

  public async findByEmail(email: string): Promise<User> {
    return Users.query()
      .select(
        Users.selectId,
        Users.selectEmail,
        Users.selectName,
        Users.selectPassword,
        "role.name as role",
        Users.selectProvider,
        "user.status",
        "user.campus_id",
        "user.company_id"
      )
      .from(Users.tableName)
      .join(Roles.tableName, "role.id", Users.selectRoleId)
      .whereRaw(`BTRIM(LOWER(email)) = '${email.trim().toLowerCase()}'`)
      .whereNotDeleted()
      .first();
  }

  public async findByMentor(id: string): Promise<User[]> {
    return Users.query()
      .select()
      .from(Users.tableName)
      .join("user_internship", "user_internship.mentee_id", "user.id")
      .join("internship", "internship.id", "user_internship.internship_id")
      .where("internship.mentor_id", "=", id)
      .where('user_internship.status','active')
      .where("user.squad_id", null);
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await Users.query()
    .whereNotDeleted()
    .findById(userId)
    .withGraphFetched("[role,campus]");
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    return findUser;
  }

  public async detailMentee(userId: string): Promise<User> {
    const findUser:any = await Users.query().findById(userId)
    .withGraphFetched("[user_internship.[document,internship.[city,province,mentor]],role,campus,working_experience,organization_experience,certificate,city,province,residence_city,residence_province]")
    .modifyGraph('user_internship',builder => {
      builder.where('status','active');
      builder.orWhere('status','graduate');
      builder.orderBy('id','desc');
    });

    if (!findUser) throw new HttpException(409, "User doesn't exist");
    //handle status
    // let statusList = ['REGISTRASI ONLINE','SELEKSI BERKAS','INTERVIEW','PENGUMUMAN']
    // let currentStatus = 'REGISTRASI ONLINE'
    // let histroyStatus = []
    // if(findUser.campus){

    // }
    return findUser;
  }

  public async createUser(userData: any): Promise<User> {
    const findUser: User = await Users.query().select()
    .from(Users.tableName)
    .whereRaw(`BTRIM(email) = '${userData.email.trim()}'`)
    .whereNotDeleted()
    .first();
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const findRole: Role = await Roles.query().select().from(Roles.tableName).where("name", "=", userData.role_id).first();
    if (!findRole) throw new HttpException(404, "Role doesn't exist");

    //if create from mitra
    if (userData.role_id === "Super Admin" && userData.internal == null) {
      const paramCampus = {
        name: userData.name,
        address: userData.address,
        email: userData.email.trim(),
        phone: userData.no_hp,
        faculty: userData.faculty,
        major: userData.major,
        type: userData.type,
        major_list: userData.major_list,
      };

      const createCampus: Campus = await ModelCampus.query()
        .insert({ id: generateId(), ...paramCampus })
        .into(ModelCampus.tableName);

      userData = { ...userData, campus_id: createCampus.id };
      delete userData.company_id;
    }

    const hashedPassword = await hash(userData.password);
    const linkVerification = userData.linkVerification;
    const internshipId = userData.internship_id;
    const surat_rekomendasi = userData.surat_rekomendasi;
    delete userData.linkVerification;
    delete userData.internship_id;
    delete userData.type;
    delete userData.faculty;
    delete userData.major_list;
    delete userData.surat_rekomendasi;
    delete userData.major;

    if(userData.role_id === 'HC Com' || userData.internal == true){
      userData.status = 'active'
    }

    const createUserData: User = await Users.query()
      .insert({ id: generateId(), ...userData, password: hashedPassword, role_id: findRole.id })
      .into(Users.tableName);

    if (userData.role_id === "Mentee") {
      if(internshipId){
        const userInternship = {
          mentee_id: createUserData.id,
          internship_id: internshipId,
          review: 0,
        };
  
        const createUserInternship: any = await ModelUserInternship.query()
          .insert({ id: generateId(), ...userInternship })
          .into(ModelUserInternship.tableName);
        if (!createUserInternship) throw new HttpException(404, "Role doesn't exist");
  
        //if surat rekomendasi
        const insertBerkas: any = await ModelUserInternshipDocument.query()
          .insert({
            id: generateId(),
            user_internship_id: createUserInternship.id,
            key: "surat_rekomendasi",
            value: surat_rekomendasi,
          })
          .into(ModelUserInternshipDocument.tableName);
        if (!insertBerkas) throw new HttpException(404, "Role doesn't exist");
      }
      
    }
    if(userData.role_id != 'HC Com' || userData.internal == true){
      let user: any = await Users.query().where("id", createUserData.id).withGraphFetched("[role,campus]").first();
      //formating
      user = {
        id: user.id,
        nik: user.nik,
        name: user.name,
        email: user.email.trim(),
        role: user.role.name,
        no_hp: user.no_hp,
        status: user.status,
        type: user.campus ? user.campus.type : "",
      };
      //email
      const emailProvider = new NodeMailerProvier();
      const fs = require("fs");
      const handlebars = require("handlebars");
      let pathview = join(process.cwd(), "/src/views/verify-user.html");
      const source = fs.readFileSync(pathview, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        link: linkVerification + "?token=" + Buffer.from(JSON.stringify(user)).toString("base64"),
        name: userData.name,
        email: userData.email,
      };

      emailProvider.send({
        email: userData.email,
        subject: "Verifikasi Akun",
        content: template(replacements),
      });
    }

    return createUserData;
  }

  public async resendVerification(param: any): Promise<any> {
    //get user data
    const userData:any = await Users.query().where('id',param.id).withGraphFetched('[campus,role]').first()
    if(!userData) throw new HttpException(404, "User doesn't exist");
    console.log(userData)
    //formating
    const user = {
      id: userData.id,
      nik: userData.nik,
      name: userData.name,
      email: userData.email,
      role: userData.role.name,
      no_hp: userData.no_hp,
      status: userData.status,
      type: userData.campus ? userData.campus.type : "",
    };
    //send email
    const emailProvider = new NodeMailerProvier();
    const fs = require("fs");
    const handlebars = require("handlebars");
    let pathview = join(process.cwd(), "/src/views/verify-user.html");
    const source = fs.readFileSync(pathview, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      link: param.linkVerification + "?token=" + Buffer.from(JSON.stringify(user)).toString("base64"),
      name: userData.name,
      email: userData.email,
    };

    emailProvider.send({
      email: userData.email,
      subject: "Registrasi Akun",
      content: template(replacements),
    });

    return userData;
  }

  public async importUser(userData: any): Promise<any> {
    //check if there empty field
    const mahasiswa_list: any = Object.entries(userData.mahasiswa_list);
    const surat_rekomendasi = userData.surat_rekomendasi;
    const linkVerification = userData.linkVerification;

    if (mahasiswa_list.length == 0) {
      throw new HttpException(409, `Excel tidak boleh kosong!`);
    }

    const findRole: Role = await Roles.query().select().from(Roles.tableName).where("name", "=", "Mentee").first();
    if (!findRole) throw new HttpException(404, "Role doesn't exist");

    for (let [key, value] of mahasiswa_list) {
      console.log(key);
      const isEmpty = Object.values(value).some(x => x === null || x === "" || x == undefined);
      if (isEmpty) {
        throw new HttpException(409, `Excel tidak sesuai dengan format!`);
      }
      const findUser: User = await Users.query().select().from(Users.tableName)
      .whereNotDeleted()
      .whereRaw(`BTRIM(email) = '${value.email.trim()}'`)
      .first();
      if (findUser) throw new HttpException(409, `This email ${value.email} already exists`);
    }

    for (let [key, value] of mahasiswa_list) {
      console.log(key);
      const hashedPassword = await hash(value.email);
      const createUserData: User = await Users.query()
        .insert({ id: generateId(), ...value, campus_id: userData.campus_id, password: hashedPassword, role_id: findRole.id })
        .into(Users.tableName);

      const userInternship = {
        mentee_id: createUserData.id,
        internship_id: userData.internship_id,
        review: 0,
      };

      const createUserInternship: any = await ModelUserInternship.query()
        .insert({ id: generateId(), ...userInternship })
        .into(ModelUserInternship.tableName);
      if (!createUserInternship) throw new HttpException(404, "Error input daata");

      //if surat rekomendasi
      if(surat_rekomendasi){
        const insertBerkas: any = await ModelUserInternshipDocument.query()
        .insert({
          id: generateId(),
          user_internship_id: createUserInternship.id,
          key: "surat_rekomendasi",
          value: surat_rekomendasi,
        })
        .into(ModelUserInternshipDocument.tableName);
        if (!insertBerkas) throw new HttpException(404, "Role doesn't exist");
      }

      let user: any = await Users.query().where("id", createUserData.id).withGraphFetched("[role,campus]").first();
      //formating
      user = {
        id: user.id,
        nik: user.nik,
        name: user.name,
        email: user.email,
        role: user.role.name,
        no_hp: user.no_hp,
        status: user.status,
        type: user.campus ? user.campus.type : "",
      };
      //email
      const emailProvider = new NodeMailerProvier();
      const fs = require("fs");
      const handlebars = require("handlebars");
      const source = fs.readFileSync(__dirname + "/view/verify-user.html", "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        link: linkVerification + "?token=" + Buffer.from(JSON.stringify(user)).toString("base64"),
        name: user.name,
        email: user.email,
      };

      emailProvider.send({
        email: user.email,
        subject: "Registrasi Akun",
        content: template(replacements),
      });
    }

    return { message: "ok" };
  }

  public async updateUser(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");
    //check password
    const findUser: User[] = await Users.query().select().from(Users.tableName).where("id", "=", userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    if (userData.soft_skill && !isArray(userData.soft_skill)){
      userData.soft_skill = userData.soft_skill.split(',')
    }
    if (userData.hard_skill && !isArray(userData.hard_skill)){
      userData.hard_skill = userData.hard_skill.split(',')
    }
    if (userData.password) {
      const checkPass = await this.checkPassword(userData.password)
      if(!checkPass){
        throw new HttpException(404, "Password anda tidak memenuhi kriteria, perhatikan saran dibawah!");
      }
      userData.password = await hash(userData.password);
    } else {
      // rome-ignore lint/performance/noDelete: <explanation>
      delete userData.password;
    }
    await Users.query()
      .update({ ...userData })
      .where("id", "=", userId)
      .into("user");

    const updateUserData: User = await Users.query().select().from(Users.tableName).where("id", "=", userId).first();
    return updateUserData;
  }

  public async updateUserExperience(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");
    //check password
    const findUser: User[] = await Users.query().select().from(Users.tableName).where("id", "=", userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    
    //delete working experience
    const checkWorking:any = await ModelUserWorkingExperience.query().where('user_id',userId) 
    if(checkWorking.length){
      const deleteWorking:any = await ModelUserWorkingExperience.query().where('user_id',userId).delete() 
      if (!deleteWorking) throw new HttpException(409, "User doesn't exist");
    }
    for (let index = 0; index < userData.working_experience.length; index++) {
      const element = userData.working_experience[index];
      if(element.id == 0){
        const createData = await ModelUserWorkingExperience.query().insert({
          ...element,
          id: generateId(),
          user_id: userId
        }).into(ModelUserWorkingExperience.tableName);
        if (!createData) throw new HttpException(409, "User doesn't exist");
      }else{
        const updateData = await ModelUserWorkingExperience.query()
        .where('id',element.id).update({
          ...element,
          user_id: userId,
          deleted_at:null
        }).into(ModelUserWorkingExperience.tableName);
        if (!updateData) throw new HttpException(409, "User doesn't exist");
      }
    }

    //delete working experience
    const checkOrganization:any = await ModelUserOrganizationExperience.query().where('user_id',userId) 
    if(checkOrganization.length){
      const deleteOrganization:any = await ModelUserOrganizationExperience.query().where('user_id',userId).delete() 
      if (!deleteOrganization) throw new HttpException(409, "User doesn't exist");
    }
    for (let index = 0; index < userData.organization_experience.length; index++) {
      const element = userData.organization_experience[index];
      if(element.id == 0){
        const createData = await ModelUserOrganizationExperience.query().insert({
          ...element,
          id: generateId(),
          user_id: userId
        }).into(ModelUserOrganizationExperience.tableName);
        if (!createData) throw new HttpException(409, "User doesn't exist");
      }else{
        const updateData = await ModelUserOrganizationExperience.query()
        .where('id',element.id)
        .update({
          ...element,
          user_id: userId,
          deleted_at:null
        }).into(ModelUserOrganizationExperience.tableName);
        if (!updateData) throw new HttpException(409, "User doesn't exist");
      }
    }

    const updateUserData: User = await Users.query().withGraphFetched('[working_experience,organization_experience]').select().from(Users.tableName).where("id", "=", userId).first();
    return updateUserData;
  }

  public async updateCertificate(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");
    console.log(userData)
    //check password
    const findUser: User[] = await Users.query().select().from(Users.tableName).where("id", "=", userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    
    //delete working experience
    const checkData:any = await ModelUserCertification.query().where('user_id',userId) 
    if(checkData.length){
      const deleteData:any = await ModelUserCertification.query().where('user_id',userId).delete() 
      if (!deleteData) throw new HttpException(409, "User doesn't exist");
    }
    for (let index = 0; index < userData.certificate.length; index++) {
      const element = userData.certificate[index];
      if(userData[`certificate[${index}][source]`]){
        element.source = userData[`certificate[${index}][source]`]
      }
      if(element.id == 0){
        const createData = await ModelUserCertification.query().insert({
          ...element,
          id: generateId(),
          user_id: userId
        }).into(ModelUserCertification.tableName);
        if (!createData) throw new HttpException(409, "User doesn't exist");
      }else{
        const updateData = await ModelUserCertification.query().update({
          ...element,
          user_id: userId,
          deleted_at:null
        })
        .where('id',element.id)
        .into(ModelUserCertification.tableName);
        if (!updateData) throw new HttpException(409, "User doesn't exist");
      }
    }

    const updateUserData: User = await Users.query().withGraphFetched('[certificate]').select().from(Users.tableName).where("id", "=", userId).first();
    return updateUserData;
  }

  public async updateFile(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");
    console.log(userData)
    //check password
    const findUser: User[] = await Users.query().select().from(Users.tableName).where("id", "=", userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    
    await Users.query()
      .update({ ...userData })
      .where("id", "=", userId)
      .into("user");

    const updateUserData: User = await Users.query().select().from(Users.tableName).where("id", "=", userId).first();
    return updateUserData;
  }

  public async deleteUser(userId: string): Promise<User> {
    const findUser: User = await Users.query().select().from(Users.tableName).where("id", "=", userId).first();
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await Users.query().delete().where("id", "=", userId).into("user");
    return findUser;
  }

  public async verifyUser(email: string): Promise<void> {
    await Users.query().where("email", email).update({ status: UserStatus.active }).into("user");
  }

  public async checkPassword(password: string): Promise<any> {
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    if(lowercaseRegex.test(password) && uppercaseRegex.test(password) && password.length > 12){
      return true;
    }
    return false;
  }
}

export default UserService;
