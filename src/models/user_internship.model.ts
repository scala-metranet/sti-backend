import { Model, ModelObject } from "objection";
import { ModelInternship } from "./internship.model";
import { UserInternship } from "@/interfaces/user_internship.interface";
import { ModelUser } from "./user.model";
import { ModelSchedule } from "./schedule.model";
import { ModelScheduleSession } from "./schedule_session.model";
import { ModelScoring } from "./scoring.model";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelUserInternship extends softDelete(Model) implements UserInternship {
  id!: string;
  mentee_id!: string;
  internship_id!: string;
  review!: number;
  interview_date!: string;
  interviewer_id!: string;
  interview_hour!: string;
  interview_link!: string;
  schedule_id!: string;
  schedule_session_id!: string;

  status!: string;
  total_screening_score!: number;
  screening_score!: number;
  total_self_interview_score!: number;
  self_interview_score!: number;
  challenge_score!: number;
  total_score!: number;

  static tableName = "user_internship"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternship,
      join: {
        from: "user_internship.internship_id",
        to: "internship.id",
      },
    },
    document: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_internship_document.model',
      join: {
        from: "user_internship.id",
        to: "user_internship_document.user_internship_id",
      },
    },
    mentee: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "user_internship.mentee_id",
        to: "user.id",
      },
    },
    schedule: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelSchedule,
      join: {
        from: "user_internship.schedule_id",
        to: "schedule.id",
      },
    },
    session: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelScheduleSession,
      join: {
        from: "user_internship.schedule_session_id",
        to: "schedule_session.id",
      },
    },
    score: {
      relation: Model.HasManyRelation,
      modelClass: ModelScoring,
      join: {
        from: "user_internship.id",
        to: "scoring.user_internship_id",
      },
    },
    screening_answer: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_screening_answer.model',
      join: {
        from: "user_internship.id",
        to: "user_screening_answer.user_internship_id",
      },
    },
    interview_answer: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_self_interview_answer.model',
      join: {
        from: "user_internship.id",
        to: "user_self_interview_answer.user_internship_id",
      },
    },
    challenge_answer: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_challenge_answer.model',
      join: {
        from: "user_internship.id",
        to: "user_challenge_answer.user_internship_id",
      },
    },
  };
}

export type UserInternshipShape = ModelObject<ModelUserInternship>;
