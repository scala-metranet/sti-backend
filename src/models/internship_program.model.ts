import { Model, ModelObject } from "objection";
import { InternshipProgram } from "@/interfaces/internship_program.interface";
import { ModelInternship } from "./internship.model";

export class ModelInternshipProgram extends Model implements InternshipProgram {
  id!: string;
  name!: string;

  static tableName = "internship_program"; // database table name
  static idColumn = "id"; // id column name

  static relationMappings = {
    internship: {
      relation: Model.HasManyRelation,
      modelClass: ModelInternship,
      join: {
        from: "internship_program.id",
        to: "internship.program_id",
      },
    },
  };
}

export type InternshipProgramShape = ModelObject<ModelInternshipProgram>;
