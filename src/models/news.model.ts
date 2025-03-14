import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { News } from "@/interfaces/news.interface";


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelNews extends softDelete(Model) implements News{
  id!: string;
  user_id!: string;
  title!: string;
  slug!: string;
  banner!: string;
  description!: string;
  content!: string;
  category!: string;
  is_highlight!: boolean;

  static tableName = "news"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "news.user_id",
        to: "user.id",
      },
    },
  }
}


export type NewsShape = ModelObject<ModelNews>;
