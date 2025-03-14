import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelChallengeQuestion extends softDelete(Model){
  id!: string;
  internship_id!: string;
  format!: string;
  description!: string;
  is_required!: boolean;

  static tableName = "challenge_question"; // database table name
  static idColumn = "id"; // id column name
}


export type ScreeningQuestionShape = ModelObject<ModelChallengeQuestion>;
