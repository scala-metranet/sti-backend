import { Model, ModelObject } from 'objection';
import { OkrTask } from '@/interfaces/okr_task.interface';
import { ModelOkrTaskMentee } from './okr_task_mentee.model';
import { ModelOkrTaskResult } from './okr_task_result.model';
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelOkrTask extends softDelete(Model) implements OkrTask {
  id!: string;
  title!: string;
  result!: string;
  attachment!: string;
  mentee_id!: string;
  okr_id!: string;
  sprint_id!: string;
  due_date!: string;
  status!: string;
  month!: string;
  year!: string;

  static tableName = 'okr_task'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    okr: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/okr.model',
      join: {
        from: 'okr_task.okr_id',
        to: 'okr.id'
      }
    },
    task_mentee: {
      relation: Model.HasManyRelation,
      modelClass: ModelOkrTaskMentee,
      join: {
        from: 'okr_task.id',
        to: 'okr_task_mentee.okr_task_id'
      }
    },
    task_result: {
      relation: Model.HasManyRelation,
      modelClass: ModelOkrTaskResult,
      join: {
        from: 'okr_task.id',
        to: 'okr_task_result.okr_task_id'
      }
    },
  };
}

export type OkrTaskShape = ModelObject<ModelOkrTask>;
