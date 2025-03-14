import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserChallengeAnswer extends softDelete(Model){
  id!: string;
  challenge_question_id!: string;
  user_internship_id!: string;
  user_id!: string;
  format!: string;
  file!: string;
  notes!: string;
  score!: string;

  static tableName = "user_challenge_answer"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/challenge_question.model',
      join: {
        from: "user_challenge_answer.challenge_question_id",
        to: "challenge_question.id",
      },
    },
  }
}


export type UserScreeningQuestionShape = ModelObject<ModelUserChallengeAnswer>;
