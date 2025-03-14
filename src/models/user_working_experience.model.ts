import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserWorkingExperience extends softDelete(Model){
  id!: string;
  user_id!: string;
  company_name!: string;
  position!: string;
  work_type!: string;
  date_start!: string;
  date_end: string;
  notes: string;

  static tableName = "user_working_experience"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "user_working_experience.user_id",
        to: "user.id",
      },
    },
  }
}


export type UserWorkingShape = ModelObject<ModelUserWorkingExperience>;
