import { HttpException } from "@exceptions/HttpException";
import { isEmpty } from "@utils/util";
import { generateId } from "@utils/util";
import { Company } from "@/interfaces/company.interface";
import { ModelCompany } from "@/models/company.model";
import { Roles } from "@/models/roles.model";
import { Users } from "@/models/users.model";
import { ModelUser } from "@/models/user.model";
import { ModelCompanyArea } from "@/models/company_area.model";
import { ModelCompanyUnit } from "@/models/company_unit.model";
import { hash } from "argon2";
import { ModelCampus } from "@/models/campus.model";
import { ModelCompanyProgram } from "@/models/company_program.model";
import { ModelCampusFaculty } from "@/models/campus_faculty.model";
import { ModelCampusProgram } from "@/models/campus_program.model";
import { ModelCampusMajor } from "@/models/campus_major.model";

class MitraService {
  public async findAll(param:any): Promise<any> {
    let data:any = {}
    if(param.filter === 'Mitra Perusahaan'){
      const superadminRole = await Roles.query().where('name','Super Admin').first();

      data = ModelUser.query().select().from(ModelUser.tableName)
        .where('role_id',superadminRole.id)
        .whereNotNull('company_id')
        .withGraphFetched('[company.program]')
        .whereNotDeleted();

      const page = param.page - 1;
      data = await data.page(page,param.perPage)

      //formating results
      let results = []
      data.results.map(val => {
        results.push({
          id: val.company.id,
          name: val.company.name,
          logo: val.company.logo,
          pic: val.name,
          program: val.company.program,
          jenis_mitra: 'Mitra Perusahaan'
        })
      })
      data.results = results
    }

    if(param.filter === 'Mitra Akademik'){
      const superadminRole = await Roles.query().where('name','Super Admin').first();
      
      data = ModelUser.query().select().from(ModelUser.tableName)
        .where('role_id',superadminRole.id)
        .whereNotNull('campus_id')
        .withGraphFetched('[campus.program]')
        .whereNotDeleted();

      if(param.company_id){
        data = data.where('company_id',param.company_id);
      }
      
      if(param.type == 'smk'){
        data = data.whereNotExists(
          ModelCampus.query()
            .where('type','universitas')
            .whereColumn('campus.id','user.campus_id')
            .whereNull('deleted_at')
        )
      }

      if(param.type == 'universitas'){
        data = data.whereNotExists(
          ModelCampus.query()
            .where('type','smk')
            .whereColumn('campus.id','user.campus_id')
            .whereNull('deleted_at')

        )
      }

      if(param.search){
        data = data.whereExists(
          ModelCampus.query()
            .whereRaw(`name ILIKE '%${param.search}%'`)
            .whereColumn('campus.id','user.campus_id')
            .whereNull('deleted_at')
        )
      }

      const page = param.page - 1;
      data = await data.orderBy('id','desc').page(page,param.perPage)

      //formating results
      let results = []
      data.results.map(val => {
        results.push({
          id: val.campus.id,
          name: val.campus.name,
          logo: val.photo,
          pic: val.name,
          program: val.campus.program,
          jenis_mitra: 'Mitra Akademik'
        })
      })
      data.results = results
    }

    return data;
  }

  public async findById(param: any): Promise<Company> {
    let data:any = {}
    const superadminRole = await Roles.query().where('name','Super Admin').first();
    if(param.type === 'Mitra Perusahaan'){
      data = await ModelCompany.query().withGraphFetched('[area.unit,program]').where('id',param.id)
      //get pic

      let pic:any = await ModelUser.query().where('company_id',param.id).where('role_id',superadminRole.id).first()
      if(data.length){
        data[0].pic = pic
      }
    }else{
      data = await ModelCampus.query().withGraphFetched('[faculty.major,major,program]').where('id',param.id)
      //get pic

      let pic:any = await ModelUser.query().where('campus_id',param.id).where('role_id',superadminRole.id).first()
      if(data.length){
        data[0].logo = pic.photo
        data[0].pic = pic
      }
    }

    return data;
  }

  public async companyFilter(): Promise<Company> {
    let data:any = []
    data = await ModelCompany.query().withGraphFetched('[area.unit]').whereNotDeleted();

    return data;
  }

  public async create(param: any): Promise<Company> {
    //get superadmin role
    const superadminRole = await Roles.query().where('name','Super Admin').first();
    
    let mitraParam = {}
    if(param.role_id === 'Mitra Perusahaan'){
      const createCompany:any = await ModelCompany.query()
      .insert({
        id: generateId(),
        name: param.mitra.name,
        website: param.mitra.website,
        logo: param.attachment['mitra[logo]'],
        address: '-',
        cfu:'-',
        department:'-',
        unit:'-',
        description:'-',
        type:'-',
        // file_ttd: param.attachment['mitra[file_ttd]'],
        // nama_manager: param.mitra.nama_manager,
        // jabatan: param.mitra.jabatan
      }).into(ModelCompany.tableName)
      if (!createCompany) throw new HttpException(409, "Failed to save!");
      
      for (let index = 0; index < param.area.length; index++) {
        const area = param.area[index];
        
        const createArea:any = await ModelCompanyArea.query()
        .insert({
          id: generateId(),
          company_id: createCompany.id,
          name: area.name,
          province_id: area.province_id,
          city_id: area.city_id,
          address: area.address,
          file_ttd:param.attachment[`area[${index}][file_ttd]`],
          nama_manager:area.nama_manager,
          jabatan:area.jabatan
        }).into(ModelCompanyArea.tableName)
        if (!createArea) throw new HttpException(409, "Failed to save!");

        for (let index1 = 0; index1 < area.unit.length; index1++) {
          const unit = area.unit[index1];
          
          const createUnit:any = await ModelCompanyUnit.query()
          .insert({
            id: generateId(),
            company_area_id: createArea.id,
            company_id: createCompany.id,
            name: unit.name,
            description: unit.description
          }).into(ModelCompanyUnit.tableName)
          if (!createUnit) throw new HttpException(409, "Failed to save!");
        }
      }

      mitraParam = {
        company_id: createCompany.id,
        photo: param.attachment['mitra[logo]']
      }

      //input program
      for (let index = 0; index < param.program.length; index++) {
        const program = param.program[index];
        const createCompanyProgram:any = await ModelCompanyProgram.query()
        .insert({
          id: generateId(),
          company_id: createCompany.id,
          program: program.program,
          mou: param.attachment[`program[${index}][mou]`],
          date_start: program.date_start,
          date_end: program.date_end
        }).into(ModelCompanyProgram.tableName)
        if (!createCompanyProgram) throw new HttpException(409, "Failed to save!");
      }
    }else{
      //TODO: mitra akademik univ and smk
      const createMitra:any = await ModelCampus.query()
      .insert({
        id: generateId(),
        name: param.mitra.name,
        email: param.email,
        phone: param.no_hp,
        website: param.mitra.website,
        address: param.address,
        type: param.mitra.type,
        city_id: param.mitra.city_id,
        province_id: param.mitra.province_id,
        company_id: param.company_id
      }).into(ModelCampus.tableName)
      if (!createMitra) throw new HttpException(409, "Failed to save!");
      
      if(param.mitra.type === 'universitas'){
        for (let index = 0; index < param.faculty.length; index++) {
          const area = param.faculty[index];
          
          const createFaculty:any = await ModelCampusFaculty.query()
          .insert({
            id: generateId(),
            campus_id: createMitra.id,
            name: area.name,
          }).into(ModelCampusFaculty.tableName)
          if (!createFaculty) throw new HttpException(409, "Failed to save!");
  
          for (let index1 = 0; index1 < area.major.length; index1++) {
            const unit = area.major[index1];
            
            const createMajor:any = await ModelCampusMajor.query()
            .insert({
              id: generateId(),
              campus_faculty_id: createFaculty.id,
              campus_id: createMitra.id,
              name: unit.name,
              level: unit.level
            }).into(ModelCampusMajor.tableName)
            if (!createMajor) throw new HttpException(409, "Failed to save!");
          }
        }
      }

      if(param.mitra.type === 'smk'){
        for (let index1 = 0; index1 < param.major.length; index1++) {
          const unit = param.major[index1];
          
          const createMajor:any = await ModelCampusMajor.query()
          .insert({
            id: generateId(),
            campus_id: createMitra.id,
            name: unit.name,
          }).into(ModelCampusMajor.tableName)
          if (!createMajor) throw new HttpException(409, "Failed to save!");
        }
      }
     

      mitraParam = {
        campus_id: createMitra.id,
        photo: param.attachment['mitra[logo]']
      }

      //input program
      for (let index = 0; index < param.program.length; index++) {
        const program = param.program[index];
        const createMitraProgram:any = await ModelCampusProgram.query()
        .insert({
          id: generateId(),
          campus_id: createMitra.id,
          program: program.program,
          mou: param.attachment[`program[${index}][mou]`],
          date_start: program.date_start,
          date_end: program.date_end
        }).into(ModelCampusProgram.tableName)
        if (!createMitraProgram) throw new HttpException(409, "Failed to save!");
      }
    }
		let hashedPassword = await hash('password')
    if(param.password){
      hashedPassword = await hash(param.password)
    }
    const paramUser = {
      email:param.email,
      name:param.name,
      nik: param.nik,
      no_hp: param.no_hp,
      department: param.department,
      position: param.position,
      role_id: superadminRole.id,
      company_id: param.company_id,
      password: hashedPassword,
      status: 'active',
      ...mitraParam
    }
    const createUser:any = await Users.query()
      .insert({ 
        id: generateId(), 
        ...paramUser 
      })
      .into(ModelUser.tableName);

    // //email 
    // let user: any = await Users.query().where("id", createUser.id).withGraphFetched("[role,campus]").first();
    // //formating
    // user = {
    //   id: user.id,
    //   nik: user.nik,
    //   name: user.name,
    //   email: user.email.trim(),
    //   role: user.role.name,
    //   no_hp: user.no_hp,
    //   status: user.status,
    //   type: user.campus ? user.campus.type : "",
    // };
    // //email
    // const emailProvider = new NodeMailerProvier();
    // const fs = require("fs");
    // const handlebars = require("handlebars");
    // let pathview = join(process.cwd(), "/src/views/verify-user.html");
    // const source = fs.readFileSync(pathview, "utf-8").toString();
    // const template = handlebars.compile(source);
    // const replacements = {
    //   link: "https://level-up.id/verification" + "?token=" + Buffer.from(JSON.stringify(user)).toString("base64"),
    //   name: user.name,
    //   email: user.email,
    // };

    // emailProvider.send({
    //   email: user.email,
    //   subject: "Verifikasi Akun",
    //   content: template(replacements),
    // });

    return createUser;
  }

  public async updateDetail(id: string, param: any): Promise<any> {
    if(param.role_id === 'Mitra Perusahaan'){
      const data: Company[] = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id);
      if (!data) throw new HttpException(409, "Data doesn't exist");

      let paramCompany:any = {
        name: param.name,
        website: param.website,
        // nama_manager: param.nama_manager,
        // jabatan: param.jabatan
      }
      // if(param.attachment['file_ttd']){
      //   paramCompany = {
      //     ...paramCompany,
      //     file_ttd: param.attachment['file_ttd']
      //   }
      // }
      if(param.attachment['logo']){
        paramCompany = {
          ...paramCompany,
          logo: param.attachment['logo']
        }
      }
      const updateCompany:any = await ModelCompany.query()
      .where('id',id)
      .update({
        ...paramCompany
      }).into(ModelCompany.tableName)
      if (!updateCompany) throw new HttpException(409, "Failed to save!");
      
      //delete area
      const companyArea:any = await ModelCompanyArea.query().whereNotDeleted().where('company_id',id).count().first()
      if(companyArea.count != 0){
        const deleteArea:any = await ModelCompanyArea.query().whereNotDeleted().where('company_id',id).delete()
        if (!deleteArea) throw new HttpException(409, "Failed to delete!");
      }

      const CompanyUnit:any = await ModelCompanyUnit.query().whereNotDeleted().where('company_id',id).count().first()
      if(CompanyUnit.count != 0){
        const deleteUnit:any = await ModelCompanyUnit.query().whereNotDeleted().where('company_id',id).delete()
        if (!deleteUnit) throw new HttpException(409, "Failed to delete!");
      }

      for (let index = 0; index < param.area.length; index++) {
        const area = param.area[index];
        let dataArea:any = await ModelCompanyArea.query().where('id',area.id).first()
        if(dataArea){
          let paramUpdate:any = {
            name: area.name,
            province_id: area.province_id,
            city_id: area.city_id,
            address: area.address,
            nama_manager:area.nama_manager,
            jabatan:area.jabatan,
            deleted_at: null
          }
          if(param.attachment[`area[${index}][file_ttd]`]){
            paramUpdate = {...paramUpdate,file_ttd:param.attachment[`area[${index}][file_ttd]`]}
          }
          dataArea = await ModelCompanyArea.query()
          .where('id',dataArea.id)
          .update(paramUpdate).into(ModelCompanyArea.tableName)
          if (!dataArea) throw new HttpException(409, "Failed to save!");

          dataArea = await ModelCompanyArea.query().where('id',area.id).first()
        }else{
          dataArea = await ModelCompanyArea.query()
          .insert({
            id: generateId(),
            company_id: id,
            name: area.name,
            province_id: area.province_id,
            city_id: area.city_id,
            nama_manager:area.nama_manager,
            file_ttd:param.attachment[`area[${index}][file_ttd]`],
            jabatan:area.jabatan,
            address: area.address
          }).into(ModelCompanyArea.tableName)
          if (!dataArea) throw new HttpException(409, "Failed to save!");
        }
        for (let index1 = 0; index1 < area.unit.length; index1++) {
          const unit = area.unit[index1];
          let dataUnit:any = await ModelCompanyUnit.query().where('id',unit.id).first()
          if(dataUnit){
            dataUnit = await ModelCompanyUnit.query()
            .where('id',dataUnit.id)
            .update({
              company_area_id: dataArea.id,
              company_id: id,
              name: unit.name,
              description: unit.description,
              deleted_at: null
            }).into(ModelCompanyUnit.tableName)
            if (!dataUnit) throw new HttpException(409, "Failed to save!");
          }else{
            dataUnit = await ModelCompanyUnit.query()
            .insert({
              id: generateId(),
              company_area_id: dataArea.id,
              company_id: id,
              name: unit.name,
              description: unit.description
            }).into(ModelCompanyUnit.tableName)
            if (!dataUnit) throw new HttpException(409, "Failed to save!");
          }
          
        }
        
      }
      const updateData: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id).first();
      return updateData;
    }
    if(param.role_id === 'Mitra Akademik'){
      console.log(param,id)
      const data:any = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id).first();
      if (!data) throw new HttpException(409, "Data doesn't exist");

      let paramCompany:any = {
        name: param.name,
        website: param.website,
        province_id: param.province_id,
        city_id: param.city_id
      }
      if(param.attachment['logo']){
        const superadminRole = await Roles.query().where('name','Super Admin').first();

        const updateUser:any = await Users.query()
        .where('campus_id',id)
        .where('role_id',superadminRole.id)
        .update({ 
          photo: param.attachment['logo'] 
        })
        .into(ModelUser.tableName);
        if (!updateUser) throw new HttpException(409, "Data doesn't exist");
      }
      const updateCampus:any = await ModelCampus.query()
      .where('id',id)
      .update({
        ...paramCompany
      }).into(ModelCampus.tableName)
      if (!updateCampus) throw new HttpException(409, "Failed to save!");
      
      if(param.type === 'universitas'){
        const campusFaculty:any = await ModelCampusFaculty.query().whereNotDeleted().where('campus_id',id).count().first()
        if(campusFaculty.count != 0){
          const deleteFaculty:any = await ModelCampusFaculty.query().whereNotDeleted().where('campus_id',id).delete()
          if (!deleteFaculty) throw new HttpException(409, "Failed to delete!");
        }

        const campusMajor:any = await ModelCampusMajor.query().whereNotDeleted().where('campus_id',id).count().first()
        if(campusMajor.count != 0){
          const deleteMajor:any = await ModelCampusMajor.query().whereNotDeleted().where('campus_id',id).delete()
          if (!deleteMajor) throw new HttpException(409, "Failed to delete!");
        }

        for (let index = 0; index < param.faculty.length; index++) {
          const area = param.faculty[index];
          let dataArea:any = await ModelCampusFaculty.query().where('id',area.id).first()
          if(dataArea){
            dataArea = await ModelCampusFaculty.query()
            .where('id',dataArea.id)
            .update({
              name: area.name,
              deleted_at: null
            }).into(ModelCampusFaculty.tableName)
            if (!dataArea) throw new HttpException(409, "Failed to save!");

            dataArea = await ModelCampusFaculty.query().where('id',area.id).first()
          }else{
            dataArea = await ModelCampusFaculty.query()
            .insert({
              id: generateId(),
              campus_id: id,
              name: area.name,
            }).into(ModelCampusFaculty.tableName)
            if (!dataArea) throw new HttpException(409, "Failed to save!");
          }
          for (let index1 = 0; index1 < area.major.length; index1++) {
            const unit = area.major[index1];
            let dataUnit:any = await ModelCampusMajor.query().where('id',unit.id).first()
            if(dataUnit){
              dataUnit = await ModelCampusMajor.query()
              .where('id',dataUnit.id)
              .update({
                name: unit.name,
                level: unit.level,
                deleted_at: null
              }).into(ModelCampusMajor.tableName)
              if (!dataUnit) throw new HttpException(409, "Failed to save!");
            }else{
              dataUnit = await ModelCampusMajor.query()
              .insert({
                id: generateId(),
                campus_faculty_id: dataArea.id,
                campus_id: id,
                name: unit.name,
                level: unit.level
              }).into(ModelCampusMajor.tableName)
              if (!dataUnit) throw new HttpException(409, "Failed to save!");
            }
            
          }
          
        }
      }else{
        const campusMajor:any = await ModelCampusMajor.query().whereNotDeleted().where('campus_id',id).count().first()
        if(campusMajor.count != 0){
          const deleteMajor:any = await ModelCampusMajor.query().whereNotDeleted().where('campus_id',id).delete()
          if (!deleteMajor) throw new HttpException(409, "Failed to delete!");
        }

        for (let index = 0; index < param.major.length; index++) {
          const unit = param.major[index];
          let dataUnit:any = await ModelCampusMajor.query().where('id',unit.id).first()
          if(dataUnit){
            dataUnit = await ModelCampusMajor.query()
            .where('id',dataUnit.id)
            .update({
              name: unit.name,
              level: unit.level,
              deleted_at: null
            }).into(ModelCampusMajor.tableName)
            if (!dataUnit) throw new HttpException(409, "Failed to save!");
          }else{
            dataUnit = await ModelCampusMajor.query()
            .insert({
              id: generateId(),
              campus_id: id,
              name: unit.name,
              level: unit.level
            }).into(ModelCampusMajor.tableName)
            if (!dataUnit) throw new HttpException(409, "Failed to save!");
          }
          
        }
      }
      
      const updateData: any = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id).first();
      return updateData;
    }
    return {data:true};
  }

  public async updatePic(id: string, param: any): Promise<any> {
    if(param.role_id === 'Mitra Perusahaan'){
      const data: Company[] = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id);
      if (!data) throw new HttpException(409, "Data doesn't exist");

      const superadminRole = await Roles.query().where('name','Super Admin').first();
      
      let paramUser:any = {
        email:param.email,
        name:param.name,
        nik: param.nik,
        no_hp: param.no_hp,
        department: param.department,
        position: param.position,
        company_area_id: param.company_area_id,
        company_unit_id: param.company_unit_id
      }
      let hashedPassword = null;
      if(param.password){
        hashedPassword = await hash(param.password)
      }
      if(hashedPassword){
        paramUser = {password:hashedPassword,...paramUser}
      }
      const updateUser:any = await Users.query()
        .where('company_id',id)
        .where('role_id',superadminRole.id)
        .update({ 
          ...paramUser 
        })
        .into(ModelUser.tableName);
      if (!updateUser) throw new HttpException(409, "Update failed");
    }else if(param.role_id === 'Mitra Akademik'){
      const data:any = await ModelCampus.query().select().from(ModelCampus.tableName).where("id", "=", id).first();
      if (!data) throw new HttpException(409, "Data doesn't exist");

      const superadminRole = await Roles.query().where('name','Super Admin').first();
      
      const user:any = await Users.query().where('campus_id',id).where('role_id',superadminRole.id).first();
      if (!user) throw new HttpException(409, "Data doesn't exist");

      if(param.email != user.email){
        const findUser:any = await Users.query().select().from(Users.tableName)
        .whereNotDeleted()
        .whereRaw(`BTRIM(email) = '${param.email.trim()}'`)
        .first();
        if (findUser) throw new HttpException(409, `This email ${param.email} already exists`);
      }

      let paramUser:any = {
        email:param.email,
        name:param.name,
        nik: param.nik,
        no_hp: param.no_hp,
        position: param.position,
      }
      let hashedPassword = null;
      if(param.password){
        hashedPassword = await hash(param.password)
      }
      if(hashedPassword){
        paramUser = {password:hashedPassword,...paramUser}
      }
      const updateUser:any = await Users.query()
        .where('campus_id',id)
        .where('role_id',superadminRole.id)
        .update({ 
          ...paramUser 
        })
        .into(ModelUser.tableName);
      if (!updateUser) throw new HttpException(409, "Update failed");

      const updateMitra:any = await ModelCampus.query()
        .where('id',id)
        .update({
          email: param.email,
          phone: param.no_hp
        })
        .into(ModelCampus.tableName);
      if (!updateMitra) throw new HttpException(409, "Update failed");
    }
    return {data:true};
  }

  public async updateProgram(id: string, param: any): Promise<any> {
    if(param.role_id === 'Mitra Perusahaan'){
      //delete program
      const CompanyProgram:any = await ModelCompanyProgram.query().whereNotDeleted().where('company_id',id).count().first()
      if(CompanyProgram.count != 0){
        const deleteProgram:any = await ModelCompanyProgram.query().whereNotDeleted().where('company_id',id).delete()
        if (!deleteProgram) throw new HttpException(409, "Failed to delete!");
      }

      //input program
      for (let index = 0; index < param.program.length; index++) {
        const program = param.program[index];
        let dataProgram:any = await ModelCompanyProgram.query().where('id',program.id).first()
        if(dataProgram){
          let paramUpdate:any = {
            program: program.program,
            mou: param.attachment[`program[${index}][mou]`],
            date_start: program.date_start,
            date_end: program.date_end,
            deleted_at: null
          }
          if(param.attachment[`program[${index}][mou]`]){
            paramUpdate = {
              ...paramUpdate,
              mou: param.attachment[`program[${index}][mou]`]
            }
          }
          dataProgram = await ModelCompanyProgram.query()
          .where('id',dataProgram.id)
          .update(paramUpdate).into(ModelCompanyProgram.tableName)
          if (!dataProgram) throw new HttpException(409, "Failed to save!");

          dataProgram = await ModelCompanyProgram.query().where('id',program.id).first()
        }else{
          let paramInsert:any = {
            id: generateId(),
            company_id: id,
            program: program.program,
            mou: param.attachment[`program[${index}][mou]`],
            date_start: program.date_start,
            date_end: program.date_end
          }
          if(param.attachment[`program[${index}][mou]`]){
            paramInsert = {
              ...paramInsert,
              mou: param.attachment[`program[${index}][mou]`]
            }
          }

          dataProgram = await ModelCompanyProgram.query()
          .insert(paramInsert).into(ModelCompanyProgram.tableName)
          if (!dataProgram) throw new HttpException(409, "Failed to save!");
        }
      }
    }else if(param.role_id === 'Mitra Akademik'){
      //delete program
      const CompanyProgram:any = await ModelCampusProgram.query().whereNotDeleted().where('campus_id',id).count().first()
      if(CompanyProgram.count != 0){
        const deleteProgram:any = await ModelCampusProgram.query().whereNotDeleted().where('campus_id',id).delete()
        if (!deleteProgram) throw new HttpException(409, "Failed to delete!");
      }

      //input program
      for (let index = 0; index < param.program.length; index++) {
        const program = param.program[index];

        let dataProgram:any = await ModelCampusProgram.query().where('id',program.id).first()

        if(dataProgram){
          let paramUpdate:any = {
            program: program.program,
            mou: param.attachment[`program[${index}][mou]`],
            date_start: program.date_start,
            date_end: program.date_end,
            deleted_at: null
          }
          if(param.attachment[`program[${index}][mou]`]){
            paramUpdate = {
              ...paramUpdate,
              mou: param.attachment[`program[${index}][mou]`]
            }
          }
          dataProgram = await ModelCampusProgram.query()
          .where('id',dataProgram.id)
          .update(paramUpdate).into(ModelCampusProgram.tableName)
          if (!dataProgram) throw new HttpException(409, "Failed to save!");

          dataProgram = await ModelCampusProgram.query().where('id',program.id).first()
        }else{
          let paramInsert:any = {
            id: generateId(),
            campus_id: id,
            program: program.program,
            mou: param.attachment[`program[${index}][mou]`],
            date_start: program.date_start,
            date_end: program.date_end
          }
          if(param.attachment[`program[${index}][mou]`]){
            paramInsert = {
              ...paramInsert,
              mou: param.attachment[`program[${index}][mou]`]
            }
          }

          dataProgram = await ModelCampusProgram.query()
          .insert(paramInsert).into(ModelCampusProgram.tableName)
          if (!dataProgram) throw new HttpException(409, "Failed to save!");
        }
      }
    }
    return {data:true};
  }

  public async update(id: string, param: Company): Promise<Company> {
    if (isEmpty(param)) throw new HttpException(400, "param is empty");

    const data: Company[] = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id);
    if (!data) throw new HttpException(409, "Data doesn't exist");

    await ModelCompany.query().update(param).where("id", "=", id).into("company");

    const updateData: Company = await ModelCompany.query().select().from(ModelCompany.tableName).where("id", "=", id).first();
    return updateData;
  }

  public async delete(param: any): Promise<Company> {
    const superadminRole = await Roles.query().where('name','Super Admin').first();
    if(param.type === 'Mitra Perusahaan'){
      await ModelCompany.query().withGraphFetched('[area.unit,program]').where('id',param.id).delete()
      await ModelUser.query().where('company_id',param.id).where('role_id',superadminRole.id).delete()
    }else{
      await ModelCampus.query().withGraphFetched('[faculty.major,major,program]').where('id',param.id).delete()
      await ModelUser.query().where('campus_id',param.id).where('role_id',superadminRole.id).delete()
    }

    return {...param};
  }
}

export default MitraService;
