import { Model, ModelObject } from "objection";
import { Internship } from "@/interfaces/internship.interface";
import { ModelCompany } from "./company.model";
import { ModelInternshipProgram } from "./internship_program.model";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelProvince } from "./province.model";
import { ModelCity } from "./city.model";
import { ModelInternshipCampus } from "./internship_campus.model";
import { ModelUser } from "./user.model";

// Specify the options for this plugin. This are the defaults.
const softDelete = objectionSoftDelete({
    columnName: 'deleted_at',
    deletedValue: new Date(),
    notDeletedValue: null,
});
export class ModelInternship extends softDelete(Model) implements Internship {
  id!: string;
  name!: string;
  mentor_id!: string;
  description!: string;
  company_id!: string;
  program_id!: string;
  period_start!: string;
  period_end!: string;
  type!: string;
  batch_master_id!: string;

  static tableName = "internship"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelCompany,
      join: {
        from: "internship.company_id",
        to: "company.id",
      },
    },
    program: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelInternshipProgram,
      join: {
        from: "internship.program_id",
        to: "internship_program.id",
      },
    },
    province: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelProvince,
      join: {
        from: "internship.province_id",
        to: "province.id",
      },
    },
    city: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelCity,
      join: {
        from: "internship.city_id",
        to: "city.id",
      },
    },
    mentor: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUser,
      join: {
        from: "internship.mentor_id",
        to: "user.id",
      },
    },
    internship_campus: {
      relation: Model.HasManyRelation,
      modelClass: ModelInternshipCampus,
      join: {
        from: "internship.id",
        to: "internship_campus.internship_id",
      },
    },
    user_internship: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_internship.model',
      join: {
        from: "internship.id",
        to: "user_internship.internship_id",
      },
    },
    screening_question: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/screening_question.model',
      join: {
        from: "internship.id",
        to: "screening_question.internship_id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    self_interview_question: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/self_interview_question.model',
      join: {
        from: "internship.id",
        to: "self_interview_question.internship_id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    challenge_question: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/challenge_question.model',
      join: {
        from: "internship.id",
        to: "challenge_question.internship_id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    data_area: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/company_area.model',
      join: {
        from: "internship.area",
        to: "company_area.id",
      },
    },
    data_unit: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/company_unit.model',
      join: {
        from: "internship.unit",
        to: "company_unit.id",
      },
    },
    batch_master: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/batch_master.model',
      join: {
        from: "internship.batch_master_id",
        to: "batch_master.id",
      },
    },
  };
}

export type InternshipShape = ModelObject<ModelInternship>;
