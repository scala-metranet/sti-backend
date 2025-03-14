import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCampusFaculty extends softDelete(Model){
  id!: string;
  campus_id!: string;
  name!: string;
  deleted_at: string;

  static tableName = "campus_faculty"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    major: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/campus_major.model',
      join: {
        from: "campus_major.campus_faculty_id",
        to: "campus_faculty.id",
      },
    },
  }
}


export type CompanyAreaTokenShape = ModelObject<ModelCampusFaculty>;
