import { Model, ModelObject } from "objection";
import { Role } from "@interfaces/roles.interface";

export class Permission extends Model implements Role {
  id!: string;
  role_id!: string;
  user_id!: string;
  name!: string;

  static tableName = "permission"; // database table name
  static idColumn = "id"; // id column name
}

export type PermissionShape = ModelObject<Permission>;
