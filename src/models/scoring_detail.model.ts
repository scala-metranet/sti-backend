import { Model, ModelObject } from "objection";
import { ScoringDetail } from "@/interfaces/scoring.interface";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelScoringQuestion } from "./scoring_question.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoringDetail extends softDelete(Model) implements ScoringDetail {
  id!: string;
  scoring_id!: string;
  scoring_question_id!: string;
  score!: number;
  answer!: string;

  static tableName = "scoring_detail"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelScoringQuestion,
      join: {
        from: "scoring_detail.scoring_question_id",
        to: "scoring_question.id",
      },
    },
  }
}

export type ScoringDetailShape = ModelObject<ModelScoringDetail>;
