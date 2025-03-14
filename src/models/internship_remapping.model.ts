import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { InternshipRemapping } from "@/interfaces/internship.interface";
import { ModelInternship } from "./internship.model";
import { ModelUserInternship } from "./user_internship.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelInternshipRemapping extends softDelete(Model) implements InternshipRemapping{
  id!: string;
  user_internship_id!: string;
  old_internship_id!: string;
  new_internship_id!: string;
  user_id!: string;
  notes!: string;

  static tableName = "internship_remapping"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUserInternship,
      join: {
        from: "internship_remapping.user_internship_id",
        to: "user_internship.id",
      },
    },
    old_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternship,
      join: {
        from: "internship_remapping.old_internship_id",
        to: "internship.id",
      },
    },
    new_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternship,
      join: {
        from: "internship_remapping.new_internship_id",
        to: "internship.id",
      },
    },
  }
}


export type InternshipRemappingShape = ModelObject<ModelInternshipRemapping>;
