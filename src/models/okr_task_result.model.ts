import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { OkrTaskResult } from "@/interfaces/okr_task.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelOkrTaskResult extends softDelete(Model) implements OkrTaskResult {
  id!: string;
  okr_task_id!: string;
  user_id!: string;
  message!: string;
  attachment!: string;

  static tableName = "okr_task_result"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: 'user.id',
        to: 'okr_task_result.user_id'
      }
    },
  };
}

export type OkrTaskResultShape = ModelObject<ModelOkrTaskResult>;
