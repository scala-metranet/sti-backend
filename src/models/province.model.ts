import { Model, ModelObject } from "objection";

export class ModelProvince extends Model {
  id!: string;
  name!: string;

  static tableName = "province"; // database table name
  static idColumn = "id"; // id column name
}

export type ProvinceShape = ModelObject<ModelProvince>;
