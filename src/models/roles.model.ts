import { Model, ModelObject } from "objection";
import { Role } from "@interfaces/roles.interface";

export class Roles extends Model implements Role {
  id!: string;
  name!: string;

  static tableName = "role"; // database table name
  static idColumn = "id"; // id column name
}

export type RolesShape = ModelObject<Roles>;
