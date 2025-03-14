import { Model, ModelObject } from "objection";
import { Squad } from "@/interfaces/squad.interface";
import { ModelSprint } from "./sprint.model";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelSquad extends softDelete(Model) implements Squad {
  id!: string;
  name!: string;
  color!: string;
  mentor_id!: string;

  static tableName = "squad"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    mentor: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "squad.mentor_id",
        to: "user.id",
      },
    },
    mentee: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "squad.id",
        to: "user.squad_id",
      },
    },
    sprint: {
      relation: Model.HasManyRelation,
      modelClass: ModelSprint,
      join: {
        from: "squad.id",
        to: "sprint.squad_id",
      },
    },
  };
}

export type SquadShape = ModelObject<ModelSquad>;
