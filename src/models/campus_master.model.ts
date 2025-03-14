import { Model, ModelObject } from "objection";
import { CampusMaster } from "@/interfaces/campus.interface";

export class ModelCampusMaster extends Model implements CampusMaster {
  id!: string;
  name!: string;

  static tableName = "campus_master"; // database table name
  static idColumn = "id"; // id column name

  // static relationMappings = {
  //   internship: {
  //     relation: Model.HasManyRelation,
  //     modelClass: ModelInternshipsCampus,
  //     join: {
  //       from: "campus.id",
  //       to: "internship_campus.campus_id",
  //     },
  //   },
  // };
}

export type CampusMasterShape = ModelObject<ModelCampusMaster>;
