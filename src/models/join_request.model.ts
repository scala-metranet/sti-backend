import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelUser } from "./user.model";
import { JoinRequest } from "@/interfaces/join_request.interface";
import { ModelJoinRequestFeedback } from "./join_request_feedback.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelJoinRequest extends softDelete(Model) implements JoinRequest{
  id!: string;
  join_type!: string;
  name!: string;
  profession!: string;
  campus_id!: string;
  intitute_type!: string;
  faculty!: string;
  major!: string;
  concept!: string;
  topic!: string;
  total_participant!: string;
  expected_date!: string;
  proposal!: string;
  institute!: string;
  address!: string;
  email!: string;
  phone!: string;
  purpose!: string;
  info_source!: string;
  status!: string;
  feedback!: string;
  feedback_added!: string;
  feedback_user_id!: string;

  static tableName = "join_request"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    admin: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "user.id",
        to: "join_request.feedback_user_id",
      },
    },
    feedback: {
      relation: Model.HasManyRelation,
      modelClass: ModelJoinRequestFeedback,
      join: {
        from: "join_request_feedback.join_request_id",
        to: "join_request.id",
      },
    },
  }
}


export type JoinRequestShape = ModelObject<ModelJoinRequest>;
