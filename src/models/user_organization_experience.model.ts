import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserOrganizationExperience extends softDelete(Model){
  id!: string;
  user_id!: string;
  organization_name!: string;
  position!: string;
  level!: string;
  date_start!: string;
  date_end: string;
  notes: string;

  static tableName = "user_organization_experience"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "user_organization_experience.user_id",
        to: "user.id",
      },
    },
  }
}


export type UserWorkingShape = ModelObject<ModelUserOrganizationExperience>;
