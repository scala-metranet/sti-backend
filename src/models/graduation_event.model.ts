import { Model, ModelObject } from "objection";
import { GraduationEvent } from "@/interfaces/graduation.interface";
import objectionSoftDelete from 'objection-js-soft-delete';

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export class ModelGraduationEvent extends softDelete(Model) implements GraduationEvent {
  id!: string;
  company_id!: string;
  batch_master_id!: string;
  period_start!: string;
  period_end!: boolean;
  type!: string;
  title!: string;
  date!: string;
  start_hour!: string;
  end_hour!: string;
  location!: string;
  poster!: string;

  static tableName = "graduation_event"; // database table name
  static idColumn = "id"; // id column name
}

export type GraduationEventShape = ModelObject<ModelGraduationEvent>;
