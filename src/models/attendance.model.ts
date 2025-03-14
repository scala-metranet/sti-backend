import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { Attendance } from "@/interfaces/attendance.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export class ModelAttendance extends softDelete(Model) implements Attendance {
  id!: string;
  user_id!: string;
  tod_id!: string;
  tod!: string;
  health_status!: boolean;
  working_status!: string;
  check_in!: string;
  check_out!: string;
  photo_in!: string;
  photo_out!: string;
  loc_in!: string;
  loc_out!: string;
  lng_lat_in!: string;
  lng_lat_out!: string;
  score!: number;
  isScored!: boolean;

  static tableName = "attendance"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    user_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/user_internship.model',
      join: {
        from: "graduation.user_internship_id",
        to: "user_internship.id",
      },
    },
  }
}


export type AttendanceShape = ModelObject<ModelAttendance>;
