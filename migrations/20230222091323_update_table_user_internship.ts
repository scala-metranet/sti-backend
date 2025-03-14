import { Knex } from "knex";
import { UserInternshipStatus } from "../src/dtos/users.dto";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.enu('status', Object.values(UserInternshipStatus)).defaultTo('unverified');
        table.string('interviewer_id').nullable().references('id').inTable('user').onDelete('cascade');
        table.string('interview_date').nullable();
        table.dropColumn('strength');
        table.dropColumn('weakness');
        table.dropColumn('information_source');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship', table => {
    table.dropColumn('status');
    table.dropColumn('interviewer_id');
    table.dropColumn('interview_date');
  });
}
