import { Leaderboard } from "@/interfaces/leaderboard.interface";
import { Model, ModelObject } from "objection";
// import objectionSoftDelete from 'objection-js-soft-delete';
// import { ModelBatchMaster } from "./batch_master.model";
import { ModelInternship } from "./internship.model";
import { ModelUser } from "./user.model";

// const softDelete = objectionSoftDelete({
//   columnName: 'deleted_at',
//   deletedValue: new Date(),
//   notDeletedValue: null,
// });
export class ModelLeaderboard extends Model implements Leaderboard {
  id!: string;
  okr_done!: number;
  okr_total!: number;
  okr_score!: number;
  attendance_score!: number;
  scoring_score!: number;
  final_score!: number;
  user_id!: string;
  sprint_id!: string;
  internship_id!: string;

  static tableName = "leaderboard"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    sprint: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/sprint.model',
      join: {
        from: "leaderboard.sprint_id",
        to: "sprint.id",
      },
    },
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "leaderboard.user_id",
        to: "user.id",
      },
    },
    internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternship,
      join: {
        from: "leaderboard.internship_id",
        to: "internship.id",
      },
    },
  }
}


export type LeaderboardShape = ModelObject<ModelLeaderboard>;
