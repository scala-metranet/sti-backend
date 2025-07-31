import { Model, ModelObject } from "objection";
import { Project } from "@interfaces/project.interface";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelCompany } from "./company.model";
import { ModelMentor } from "./mentor.model";
import { ModelProjectMentor } from "./project_mentor.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export class ModelProject extends softDelete(Model) implements Project {
  id!: string;
  name!: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  company_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  static tableName = "project";
  static idColumn = "id";

  static relationMappings = {
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelCompany,
      join: {
        from: "project.company_id",
        to: "company.id",
      },
    },
    mentors: {
      relation: Model.ManyToManyRelation,
      modelClass: ModelMentor,
      join: {
        from: "project.id",
        through: {
          from: "project_mentor.project_id",
          to: "project_mentor.mentor_id",
        },
        to: "user.id",
      },
    },
    project_mentors: {
      relation: Model.HasManyRelation,
      modelClass: ModelProjectMentor,
      join: {
        from: "project.id",
        to: "project_mentor.project_id",
      },
    },
    sprints: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/sprint.model',
      join: {
        from: "project.id",
        to: "sprint.project_id",
      },
    },
  };
}

export type ProjectShape = ModelObject<ModelProject>;