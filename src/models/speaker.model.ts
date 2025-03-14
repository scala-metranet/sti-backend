import { Model, ModelObject } from "objection";

export class ModelSpeaker extends Model {
  id!: string;
  user_id!: string;
  expertise!: string;
  experience!: string;
  reason!: string;

  static tableName = "speaker"; // database table name
  static idColumn = "id"; // id column name
}

export type SpeakerShape = ModelObject<ModelSpeaker>;
