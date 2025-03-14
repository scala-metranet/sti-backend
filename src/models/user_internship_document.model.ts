import { Model, ModelObject } from "objection";
import { UserInternshipDocument } from "@/interfaces/user_internship_document.interface";
import { ModelUsersInternship } from "./users_internship.model";

export class ModelUserInternshipDocument extends Model implements UserInternshipDocument {
  id!: string;
  user_internship_id!: string;
  key!: string;
  value!: string;
  status!: string;
  notes!: string;

  static tableName = "user_internship_document"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUsersInternship,
      join: {
        from: "user_internship_document.user_internship_id",
        to: "user_internship.id",
      },
    },
  };
}

export type UserInternshipDocumentShape = ModelObject<ModelUserInternshipDocument>;
