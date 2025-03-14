import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelSelfInterviewQuestion extends softDelete(Model){
  id!: string;
  internship_id!: string;
  question!: string;
  is_required!: boolean;
  duration!: number;

  static tableName = "self_interview_question"; // database table name
  static idColumn = "id"; // id column name
}


export type ScreeningQuestionShape = ModelObject<ModelSelfInterviewQuestion>;
