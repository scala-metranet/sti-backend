import { Model, ModelObject } from "objection";
import { UserInternship } from "@/interfaces/user_internship.interface";
import { ModelUser } from "./user.model";
import { ModelInternships } from "./internships.model";

export class ModelUsersInternship extends Model implements UserInternship {
  id!: string;
  mentee_id!: string;
  internship_id!: string;
  review!: number;

  static tableName = "user_internship"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternships,
      join: {
        from: "user_internship.internship_id",
        to: "internship.id",
      },
    },
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "user_internship.mentee_id",
        to: "user.id",
      },
    },
    document: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_internship_document.model',
      join: {
        from: "user_internship.id",
        to: "user_internship_document.user_internship_id",
      },
    },
  };
}

export type UserInternshipShape = ModelObject<ModelUsersInternship>;
