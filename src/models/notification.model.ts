import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { Notification } from "@/interfaces/notification.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelNotification extends softDelete(Model) implements Notification {
  id!: string;
  user_id!: string;
  message!: string;
  destination!: string;

  static tableName = "notification"; // database table name
  static idColumn = "id"; // id column name
}

export type NotificationShape = ModelObject<ModelNotification>;
