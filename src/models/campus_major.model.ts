import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCampusMajor extends softDelete(Model){
  id!: string;
  campus_faculty_id!: string;
  campus_id!: string;
  name!: string;
  level!: string;
  deleted_at: string;

  static tableName = "campus_major"; // database table name
  static idColumn = "id"; // id column name
}


export type CompanyAreaTokenShape = ModelObject<ModelCampusMajor>;
