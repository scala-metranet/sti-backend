import { Model, ModelObject } from "objection";
import objectionSoftDelete from "objection-js-soft-delete";

const softDelete = objectionSoftDelete({
  columnName: "deleted_at",
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoringMaster extends softDelete(Model) {
  id!: string;
  name!: string;
  description!: string;
  start_date!: string;
  end_date!: string;
  company_id!: string;
  role_id!: string;
  internship_program_id!: string;
  is_vip!: boolean;
  deleted_at: string;

  static tableName = "scoring_master"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/company.model",
      join: {
        from: "scoring_master.company_id",
        to: "company.id",
      },
    },
    internship_program: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/internship_program.model",
      join: {
        from: "scoring_master.internship_program_id",
        to: "internship_program.id",
      },
    },
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + "/roles.model",
      join: {
        from: "scoring_master.role_id",
        to: "role.id",
      },
    },
    section: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/scoring_section.model",
      join: {
        from: "scoring_section.scoring_master_id",
        to: "scoring_master.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    question: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/scoring_question.model",
      join: {
        from: "scoring_question.scoring_master_id",
        to: "scoring_master.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    scoring: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/scoring.model",
      join: {
        from: "scoring.scoring_master_id",
        to: "scoring_master.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
  };
}

export type ScoringMasterTokenShape = ModelObject<ModelScoringMaster>;
