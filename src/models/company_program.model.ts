import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompanyProgram extends softDelete(Model){
  id!: string;
  company_id!: string;
  program!: string;
  mou!: string;
  date_start!: string;
  date_end!: string;

  static tableName = "company_program"; // database table name
  static idColumn = "id"; // id column name
}


export type CompanyProgramTokenShape = ModelObject<ModelCompanyProgram>;
