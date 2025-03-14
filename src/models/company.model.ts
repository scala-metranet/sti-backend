import { Model, ModelObject } from "objection";
import { Company } from "@interfaces/company.interface";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompany extends softDelete(Model) implements Company {
  id!: string;
  name!: string;
  cfu!: string;
  department!: string;
  unit!: string;
  description!: string;
  logo!: string;
  website!: string;
  type!: string;
  address!: string;
  nama_manager!: string;
  jabatan!: string;
  file_ttd!: string;

  static tableName = "company"; // database table name
  static idColumn = "id"; // id column name
  
  static relationMappings = {
    area: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/company_area.model',
      join: {
        from: "company_area.company_id",
        to: "company.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    program: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/company_program.model',
      join: {
        from: "company_program.company_id",
        to: "company.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
  }
}

export type CompanyShape = ModelObject<ModelCompany>;
