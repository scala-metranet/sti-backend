import { Model, ModelObject } from "objection";
import { Graduation } from "@/interfaces/graduation.interface";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export class ModelGraduation extends softDelete(Model) implements Graduation {
  id!: string;
  user_internship_id!: string;
  linkedin_url!: string;
  report_url!: string;
  is_attend!: boolean;
  reason!: string;
  status!: string;
  note!: string;
  updated_by!: string;

  static tableName = "graduation"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/user_internship.model',
      join: {
        from: "graduation.user_internship_id",
        to: "user_internship.id",
      },
    },
  }
}


export type GraduationShape = ModelObject<ModelGraduation>;
