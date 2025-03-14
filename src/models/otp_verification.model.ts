import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelOtpVerification extends softDelete(Model){
  id!: string;
  user_id!: string;
  otp_code!: string;
  expired!: string;

  static tableName = "otp_verification"; // database table name
  static idColumn = "id"; // id column name
}


export type ForgetTokenShape = ModelObject<ModelOtpVerification>;
