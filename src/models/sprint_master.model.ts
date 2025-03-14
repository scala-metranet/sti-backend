import {  SprintMaster } from "@/interfaces/batch_master.interface";
import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelBatchMaster } from "./batch_master.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelSprintMaster extends softDelete(Model) implements SprintMaster {
  id!: string;
  batch_master_id!: string;
  company_id!: string;
  internship_program_id!: string;
  period_start!: string;
  period_end!: string;
  created_by!: string;

  static tableName = "sprint_master"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    admin: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelBatchMaster,
      join: {
        from: "batch_master.id",
        to: "sprint_master.batch_master_id",
      },
    },
  }
}


export type BatchMasterShape = ModelObject<ModelSprintMaster>;
