import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoringQuestionOption extends softDelete(Model){
  id!: string;
  name!: string;
  is_true!: string;
  scoring_question_id!: string;
  deleted_at: string;

  static tableName = "scoring_question_option"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/scoring_question.model",
      join: {
        from: "scoring_question_option.scoring_question_id",
        to: "scoring_question.id",
      }
    },
  }
}


export type ScoringMasterTokenShape = ModelObject<ModelScoringQuestionOption>;
