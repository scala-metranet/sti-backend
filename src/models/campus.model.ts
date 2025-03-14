import { Model, ModelObject } from "objection";
import { Campus } from "@/interfaces/campus.interface";
import { ModelInternshipsCampus } from "./internships_campus.model";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCampus extends softDelete(Model) implements Campus {
  id!: string;
  name!: string;
  email!: string;
  address!: string;
  phone!: string;
  pic!: string;
  pic_position!: string;
  website!: string;
  type!: string;
  city_id!: string;
  province_id!: string;
  company_id!: string;


  static tableName = "campus"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    internship: {
      relation: Model.HasManyRelation,
      modelClass: ModelInternshipsCampus,
      join: {
        from: "campus.id",
        to: "internship_campus.campus_id",
      },
    },
    faculty: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/campus_faculty.model',
      join: {
        from: "campus_faculty.campus_id",
        to: "campus.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    major: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/campus_major.model',
      join: {
        from: "campus_major.campus_id",
        to: "campus.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    program: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/campus_program.model',
      join: {
        from: "campus_program.campus_id",
        to: "campus.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
  };
}

export type CampusShape = ModelObject<ModelCampus>;
