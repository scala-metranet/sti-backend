import { Model, ModelObject } from 'objection';
import { Users } from './users.model';
import { Okr } from '@/interfaces/okr.interface';
import { ModelOkrTask } from './okr_task.model';
import { ModelOkrMentee } from './okr_mentee.model';

export class ModelOkr extends Model implements Okr {
  id!: string;
  key_result!: string;
  output!: string;
  mentor_id!: string;
  sprint_id!: string;
  due_date!: string;
  description!: string;

  static tableName = 'okr'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    okr_mentee: {
      relation: Model.HasManyRelation,
      modelClass: ModelOkrMentee,
      join: {
        from: 'okr.id',
        to: 'okr_mentee.okr_id'
      }
    },
    okr_task: {
      relation: Model.HasManyRelation,
      modelClass: ModelOkrTask,
      join: {
        from: 'okr.id',
        to: 'okr_task.okr_id'
      }
    },
    mentor: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: 'okr.mentor_id',
        to: 'user.id'
      }
    },
  };
}

export type OkrShape = ModelObject<ModelOkr>;
