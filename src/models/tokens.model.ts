import { Model, ModelObject } from "objection";
import { Token } from "@interfaces/token.interface";

export class Tokens extends Model implements Token {
  id!: string;
  user_id!: string;
  access_key!: string;
  refresh_key!: string;

  static tableName = "token"; // database table name
  static idColumn = "id"; // id column name
}

export type TokensShape = ModelObject<Tokens>;
