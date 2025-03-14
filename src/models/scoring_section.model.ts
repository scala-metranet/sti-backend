import { Model, ModelObject } from "objection";
import objectionSoftDelete from 'objection-js-soft-delete';


const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelScoringSection extends softDelete(Model){
  id!: string;
  name!: string;
  scoring_master_id!: string;
  deleted_at: string;

  static tableName = "scoring_section"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    question: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + "/scoring_question.model",
      join: {
        from: "scoring_question.scoring_section_id",
        to: "scoring_section.id",
      },
      filter: f => f.whereNotDeleted(),
    },
  }
}


export type ScoringSectionTokenShape = ModelObject<ModelScoringSection>;
