import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { CompanyVisit } from "@/interfaces/company_visit.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompanyVisit extends softDelete(Model) implements CompanyVisit{
  id!: string;
  campus_id!: string;
  type!: string;
  title!: string;
  description!: string;
  date!: string;
  poster!: string;
  start_time!: string;
  end_time!: string;
  key_access!: string;
  place!: string;
  slug!: string;

  static tableName = "company_visit"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    campus: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/company_visit_campus.model',
      join: {
        from: "company_visit_campus.company_visit_id",
        to: "company_visit.id",
      },
    },
    mentee: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/users.model',
      join: {
        from: "user.company_visit_id",
        to: "company_visit.id",
      },
    },
  }
}


export type CompanyVisitShape = ModelObject<ModelCompanyVisit>;
