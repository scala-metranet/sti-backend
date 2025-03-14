import { BatchMaster } from "@/interfaces/batch_master.interface";
import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelSprintMaster } from "./sprint_master.model";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelBatchMaster extends softDelete(Model) implements BatchMaster {
  id!: string;
  name!: string;
  company_id!: string;
  internship_program_id!: string;
  period_start!: string;
  period_end!: string;
  created_by!: string;
  onboard_date!: string;
  registration_date!: string;

  static tableName = "batch_master"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    sprint_master: {
      relation: Model.HasManyRelation,
      modelClass: ModelSprintMaster,
      join: {
        from: "sprint_master.batch_master_id",
        to: "batch_master.id",
      },
    },
  }
}


export type BatchMasterShape = ModelObject<ModelBatchMaster>;
