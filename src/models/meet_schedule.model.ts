import { Model, ModelObject } from "objection";

export class ModelMeetSchedule extends Model {
  id!: string;
  user_id!: string;
  date!: string;
  start_hour!: string;
  end_hour!: string;
  information!: string;

  static tableName = "meet_schedule"; // database table name
  static idColumn = "id"; // id column name
}

export type MeetShape = ModelObject<ModelMeetSchedule>;
