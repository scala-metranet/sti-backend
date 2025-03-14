import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScreeningQuestion extends softDelete(Model){
  id!: string;
  internship_id!: string;
  question!: string;
  is_required!: boolean;

  static tableName = "screening_question"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    answer: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/screening_answer.model',
      join: {
        from: "screening_question.id",
        to: "screening_answer.screening_question_id",
      },
    },
  }
}


export type ScreeningQuestionShape = ModelObject<ModelScreeningQuestion>;
