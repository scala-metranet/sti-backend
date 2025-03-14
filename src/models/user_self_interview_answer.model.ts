import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserSelfInterviewAnswer extends softDelete(Model){
  id!: string;
  self_interview_question_id!: string;
  user_internship_id!: string;
  user_id!: string;
  answer!: string;
  score!: string;

  static tableName = "user_self_interview_answer"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/self_interview_question.model',
      join: {
        from: "user_self_interview_answer.self_interview_question_id",
        to: "self_interview_question.id",
      },
    },
  }
}


export type UserScreeningQuestionShape = ModelObject<ModelUserSelfInterviewAnswer>;
