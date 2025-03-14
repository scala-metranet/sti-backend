import { Model, ModelObject } from 'objection';

export class ModelSprintActivity extends Model {
  id!: string;
  user_id!: string;
  sprint_id!: string;
  message!: string;

  static tableName = 'sprint_activity'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: 'sprint_activity.user_id',
        to: 'user.id'
      }
    },
  };
}

export type SprintShape = ModelObject<ModelSprintActivity>;
