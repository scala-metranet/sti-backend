import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompanyArea extends softDelete(Model){
  id!: string;
  company_id!: string;
  name!: string;
  address!: string;
  city_id!: string;
  province_id!: string;
  deleted_at: string;
  nama_manager!: string;
  jabatan!: string;
  file_ttd!: string;

  static tableName = "company_area"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    unit: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/company_unit.model',
      join: {
        from: "company_unit.company_area_id",
        to: "company_area.id",
      },
    },
  }
}


export type CompanyAreaTokenShape = ModelObject<ModelCompanyArea>;
