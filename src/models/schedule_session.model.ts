import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ScheduleSession } from "@/interfaces/schedule.interface";
import { ModelSchedule } from "./schedule.model";
import { ModelUsersInternship } from "./users_internship.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScheduleSession extends softDelete(Model) implements ScheduleSession {
  id!: string;
  schedule_id!: string;
  time_start!: string;
  time_end!: string;
  zoom_link!: string;

  static tableName = "schedule_session"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    schedule: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelSchedule,
      join: {
        from: "schedule_session.schedule_id",
        to: "schedule.id",
      },
    },
    user_internship: {
      relation: Model.HasManyRelation,
      modelClass: ModelUsersInternship,
      join: {
        from: "user_internship.schedule_session_id",
        to: "schedule_session.id",
      },
    },
  };
}

export type ScheduleSessionShape = ModelObject<ModelScheduleSession>;
