import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompanyUnit extends softDelete(Model){
  id!: string;
  company_area_id!: string;
  company_id!: string;
  name!: string;
  description!: string;
  deleted_at!: string;

  static tableName = "company_unit"; // database table name
  static idColumn = "id"; // id column name
}


export type CompanyUnitTokenShape = ModelObject<ModelCompanyUnit>;
