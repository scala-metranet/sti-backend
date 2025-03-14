import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserCertification extends softDelete(Model){
  id!: string;
  user_id!: string;
  name!: string;
  number!: string;
  company!: string;
  date_start!: string;
  date_end: string;
  source: string;

  static tableName = "user_certificate"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "user_certificate.user_id",
        to: "user.id",
      },
    },
  }
}


export type UserCertificationShape = ModelObject<ModelUserCertification>;
