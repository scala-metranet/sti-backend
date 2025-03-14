import { Model, ModelObject } from "objection";
import { User } from "@interfaces/users.interface";
import { Roles } from "./roles.model";
import { ModelUserInternship } from "./user_internship.model";
import { ModelInternship } from "./internship.model";
import { ModelCampus } from "./campus.model";
import objectionSoftDelete from 'objection-js-soft-delete';
import { ModelCompany } from "./company.model";
import { ModelSquad } from "./squad.model";

// Specify the options for this plugin. This are the defaults.
const softDelete = objectionSoftDelete({
  columnName: 'deleted_at',
  deletedValue: new Date(),
  notDeletedValue: null,
});

export class Users extends softDelete(Model) implements User {
	id!: string;
	name!: string;
	email!: string;
	password!: string;
	role_id!: string;
	provider!: string;
	status: string;
  campus_id!: string;
  nik!: string;
  photo!: string;

	static tableName = "user"; // database table name
	static idColumn = "id"; // id column name
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }

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
    squad: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModelSquad,
      join: {
        from: "user.squad_id",
        to: "squad.id",
      },
    },
    working_experience: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_working_experience.model',
      join: {
        from: "user_working_experience.user_id",
        to: "user.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    organization_experience: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_organization_experience.model',
      join: {
        from: "user_organization_experience.user_id",
        to: "user.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    certificate: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/user_certification.model',
      join: {
        from: "user_certificate.user_id",
        to: "user.id",
      },
      filter: (f) => f.whereNotDeleted(),
    },
    province: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/province.model',
      join: {
        from: "user.province_id",
        to: "province.id",
      },
    },
    city: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/city.model',
      join: {
        from: "user.city_id",
        to: "city.id",
      },
    },
    residence_province: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/province.model',
      join: {
        from: "user.residence_province_id",
        to: "province.id",
      },
    },
    residence_city: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/city.model',
      join: {
        from: "user.residence_city_id",
        to: "city.id",
      },
    },
    place_of_birth_data:{
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/province.model',
      join: {
        from: "user.place_of_birth",
        to: "province.id",
      },
    }
  };
}

export type UsersShape = ModelObject<Users>;
