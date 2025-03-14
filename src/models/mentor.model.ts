import { Model, ModelObject } from "objection";
import { User } from "@interfaces/users.interface";
import { Roles } from "./roles.model";
import { ModelUserInternship } from "./user_internship.model";
import { ModelInternship } from "./internship.model";
import { ModelCampus } from "./campus.model";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelCompany } from "./company.model";

// Specify the options for this plugin. This are the defaults.
const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});
export class ModelMentor extends softDelete(Model) implements User {
	id!: string;
	name!: string;
	email!: string;
	password!: string;
	role_id!: string;
	provider!: string;
	status: string;
	squad_id!: string;

	static tableName = "user"; // database table name
	static idColumn = "id"; // id column name

	static selectId = `${this.tableName}.id`;
	static selectName = `${this.tableName}.name`;
	static selectEmail = `${this.tableName}.email`;
	static selectPassword = `${this.tableName}.password`;
	static selectRoleId = `${this.tableName}.role_id`;
	static selectProvider = `${this.tableName}.provider`;

  static relationMappings = {
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: Roles,
      join: {
        from: "user.role_id",
        to: "role.id",
      },
    },
    user_internship: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelUserInternship,
      join: {
        from: "user.id",
        to: "user_internship.mentee_id",
      },
    },
    internship: {
      relation: Model.HasManyRelation,
      modelClass: ModelInternship,
      join: {
        from: "user.id",
        to: "internship.mentor_id",
      },
    },
    campus: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelCampus,
      join: {
        from: "user.campus_id",
        to: "campus.id",
      },
    },
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelCompany,
      join: {
        from: "user.company_id",
        to: "company.id",
      },
    },
  };
}

export type MentorShape = ModelObject<ModelMentor>;
