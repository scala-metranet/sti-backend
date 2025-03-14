import { Model, ModelObject } from "objection";
import { Scoring } from "@/interfaces/scoring.interface";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelScoringDetail } from "./scoring_detail.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoring extends softDelete(Model) implements Scoring{
  id!: string;
  user_id!: string;
  created_by!: string;
  sprint_id!: string;
  squad_id!: string;
  internship_id!: string;
  score!: number;
  month!: number;
  year!: string;
  scoring_master_id!: string;
  activity_point!: number;
  activity_description!: string;
  activity_link!: string;

  static tableName = "scoring"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    detail: {
      relation: Model.HasManyRelation,
      modelClass: ModelScoringDetail,
      join: {
        from: "scoring.id",
        to: "scoring_detail.scoring_id",
      },
    },
    sprint: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/sprint.model',
      join: {
        from: "scoring.sprint_id",
        to: "sprint.id",
      },
    },
    created: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "scoring.created_by",
        to: "user.id",
      },
    },
    user: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "scoring.user_id",
        to: "user.id",
      },
    },
    master: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/scoring_master.model',
      join: {
        from: "scoring.scoring_master_id",
        to: "scoring_master.id",
      },
    },
  }
}


export type ScoringShape = ModelObject<ModelScoring>;
