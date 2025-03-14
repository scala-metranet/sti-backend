import { Knex } from "knex";
import { UserInternshipDocumentStatus } from "../src/dtos/users.dto";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship_document', table => {
        table.enu('status', Object.values(UserInternshipDocumentStatus)).after('value').defaultTo('accept');
        table.string('notes').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship_document', table => {
    table.dropColumn('status');
    table.dropColumn('notes');
  });
}
