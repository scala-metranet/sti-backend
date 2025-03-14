import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { Classes } from "@/interfaces/classes.interface";


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelClasses extends softDelete(Model) implements Classes{
  id!: string;
  user_id!: string;
  name!: string;
  slug!: string;

  static tableName = "classes"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "classes.user_id",
        to: "user.id",
      },
    },
  }
}


export type ClassesShape = ModelObject<ModelClasses>;
