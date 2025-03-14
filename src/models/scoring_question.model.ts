import { Model, ModelObject } from "objection";
import { ScoringQuestion } from "@/interfaces/scoring.interface";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoringQuestion extends softDelete(Model) implements ScoringQuestion {
  id!: string;
  question!: string;
  internship_program_id!: string;
  role_id!: string;
  company_id!: string;
  question_type!: string;
  question_order!: number;
  is_required!: boolean;
  scoring_master_id!: string;
  scoring_section_id!: string;
  deleted_at!: string;

  static tableName = "scoring_question"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    options: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/scoring_question_option.model",
      join: {
        from: "scoring_question_option.scoring_question_id",
        to: "scoring_question.id",
      },
      filter: f => f.whereNotDeleted(),
    },
    user_answer: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/scoring_detail.model",
      join: {
        from: "scoring_detail.scoring_question_id",
        to: "scoring_question.id",
      },
      filter: f => f.whereNotDeleted(),
    },
  }
}

export type ScoringQuestionShape = ModelObject<ModelScoringQuestion>;
