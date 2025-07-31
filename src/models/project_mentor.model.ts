import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelProject } from "./project.model";
import { ModelMentor } from "./mentor.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export interface ProjectMentor {
  id: string;
  project_id: string;
  mentor_id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export class ModelProjectMentor extends softDelete(Model) implements ProjectMentor {
  id!: string;
  project_id!: string;
  mentor_id!: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  static tableName = "project_mentor";
  static idColumn = "id";

  static relationMappings = {
    project: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelProject,
      join: {
        from: "project_mentor.project_id",
        to: "project.id",
      },
    },
    mentor: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelMentor,
      join: {
        from: "project_mentor.mentor_id",
        to: "user.id",
      },
    },
  };
}

export type ProjectMentorShape = ModelObject<ModelProjectMentor>;