import { Model, ModelObject } from "objection";

export class ModelCity extends Model {
  id!: string;
  name!: string;
  province_id!: string;

  static tableName = "city"; // database table name
  static idColumn = "id"; // id column name
}

export type CityShape = ModelObject<ModelCity>;
