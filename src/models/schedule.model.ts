import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { Schedule } from "@/interfaces/schedule.interface";
import { ModelScheduleSession } from "./schedule_session.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelSchedule extends softDelete(Model) implements Schedule {
  id!: string;
  date!: string;

  static tableName = "schedule"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    session: {
      relation: Model.HasManyRelation,
      modelClass: ModelScheduleSession,
      join: {
        from: "schedule_session.schedule_id",
        to: "schedule.id",
      },
    }
  };
}

export type ScheduleShape = ModelObject<ModelSchedule>;
