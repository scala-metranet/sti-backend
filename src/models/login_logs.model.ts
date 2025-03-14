import { Model, ModelObject } from "objection";
import { LoginLogs } from "@/interfaces/auth.interface";

export class ModelLoginLogs extends Model implements LoginLogs {
  id!: string;
  user_id!: string;
  ip!: string;
  status!: string;
  impersonate_by!: string;
  impersonate_reason!: string;

  static tableName = "login_logs"; // database table name
  static idColumn = "id"; // id column name
}

export type LoginLogsShape = ModelObject<ModelLoginLogs>;
