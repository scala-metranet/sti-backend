import { Model, ModelObject } from 'objection';
import { OkrTaskMentee } from '@/interfaces/okr_task.interface';

export class ModelOkrTaskMentee extends Model implements OkrTaskMentee {
  id!: string;
  okr_task_id!: string;
  mentee_id!: string;

  static tableName = 'okr_task_mentee'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: 'okr_task_mentee.mentee_id',
        to: 'user.id'
      }
    },
  };
}

export type OkrTaskShape = ModelObject<ModelOkrTaskMentee>;
