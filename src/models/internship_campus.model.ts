import { Model, ModelObject } from "objection";
import { InternshipCampus } from "@/interfaces/internship_program.interface";
import { ModelInternship } from "./internship.model";
import { ModelUsersInternship } from "./users_internship.model";

export class ModelInternshipCampus extends Model implements InternshipCampus {
  id!: string;
  campus_id!: string;
  internship_id!: string;
  quota!: number;

  static tableName = "internship_campus"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternship,
      join: {
        from: "internship_campus.internship_id",
        to: "internship.id",
      },
    },
    user_internship: {
      relation: Model.HasManyRelation,
      modelClass: ModelUsersInternship,
      join: {
        from: "internship_campus.internship_id",
        to: "user_internship.internship_id",
      },
    },
  };
}

export type InternshipCampusShape = ModelObject<ModelInternshipCampus>;
