import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScreeningAnswer extends softDelete(Model){
  id!: string;
  screening_question_id!: string;
  internship_id!: string;
  answer!: string;
  is_correct!: boolean;
  score!: number;

  static tableName = "screening_answer"; // database table name
  static idColumn = "id"; // id column name
}


export type ScreeningQuestionShape = ModelObject<ModelScreeningAnswer>;
