import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelForgetToken extends softDelete(Model){
  id!: string;
  email!: string;
  token!: string;
  is_used!: boolean;
  valid_date!: string;

  static tableName = "forget_token"; // database table name
  static idColumn = "id"; // id column name
}


export type ForgetTokenShape = ModelObject<ModelForgetToken>;
