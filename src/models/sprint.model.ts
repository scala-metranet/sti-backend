import { Model, ModelObject } from 'objection';
import { Sprint } from '@/interfaces/sprint.interface';
import { ModelOkr } from './okr.model';
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelSprint extends softDelete(Model) implements Sprint {
  id!: string;
  mentor_id!: string;
  sprint!: string;
  objective!: string;
  squad_leader_id!: string;
  squad_id!: string;
  project_id!: string;
  start_date!: string;
  end_date!: string;
  mentor_notes!: string;
  mentor_lesson!: string;

  static tableName = 'sprint'; // database table name
  static idColumn = 'id'; // id column name

  static relationMappings = {
    squad_leader: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: 'sprint.squad_leader_id',
        to: 'user.id'
      }
    },
    squad: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/squad.model',
      join: {
        from: 'sprint.squad_id',
        to: 'squad.id'
      }
    },
    project: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/project.model',
      join: {
        from: 'sprint.project_id',
        to: 'project.id'
      }
    },
    okr: {
      relation: Model.HasManyRelation,
      modelClass: ModelOkr,
      join: {
        from: 'okr.sprint_id',
        to: 'sprint.id'
      }
    },
  };
}

export type SprintShape = ModelObject<ModelSprint>;
