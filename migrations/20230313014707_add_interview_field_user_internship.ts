import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.string('interview_hour').nullable();
        table.string('interview_link').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship', table => {
    table.dropColumn('interview_hour');
    table.dropColumn('interview_link');
  });
}
