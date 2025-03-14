import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';
import { CompanyVisitCampus } from "@/interfaces/company_visit.interface";

const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelCompanyVisitCampus extends softDelete(Model) implements CompanyVisitCampus{
  id!: string;
  campus_id!: string;
  company_visit_id!: string;

  static tableName = "company_visit_campus"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    campus: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/campus.model',
      join: {
        from: "campus.id",
        to: "company_visit_campus.campus_id",
      },
    },
    company_visit: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/company_visit.model',
      join: {
        from: "company_visit.id",
        to: "company_visit_campus.company_visit",
      },
    },
  }
}


export type CompanyVisitShape = ModelObject<ModelCompanyVisitCampus>;
