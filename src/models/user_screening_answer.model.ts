import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserScreeningAnswer extends softDelete(Model){
  id!: string;
  screening_question_id!: string;
  user_internship_id!: string;
  user_id!: string;
  answer!: string;
  score!: string;

  static tableName = "user_screening_answer"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/screening_question.model',
      join: {
        from: "user_screening_answer.screening_question_id",
        to: "screening_question.id",
      },
    },
  }
}


export type UserScreeningQuestionShape = ModelObject<ModelUserScreeningAnswer>;
