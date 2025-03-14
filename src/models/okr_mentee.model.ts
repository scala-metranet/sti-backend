import { Model, ModelObject } from 'objection';
import { OkrMentee } from '@/interfaces/okr.interface';

export class ModelOkrMentee extends Model implements OkrMentee {
  id!: string;
  okr_id!: string;
  mentee_id!: string;

  static tableName = 'okr_mentee'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: 'user.id',
        to: 'okr_mentee.mentee_id'
      }
    },
  };
}

export type OkrMenteeShape = ModelObject<ModelOkrMentee>;
