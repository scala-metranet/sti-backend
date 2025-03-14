import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelUser } from "./user.model";
import {  JoinRequestFeedback } from "@/interfaces/join_request.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelJoinRequestFeedback extends softDelete(Model) implements JoinRequestFeedback{
  id!: string;
  join_request_id!: string;
  feedback!: string;
  user_id!: string;

  static tableName = "join_request_feedback"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "user.id",
        to: "join_request_feedback.user_id",
      },
    },
  }
}


export type JoinRequestFeedbackShape = ModelObject<ModelJoinRequestFeedback>;
