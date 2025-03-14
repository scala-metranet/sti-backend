import { Knex } from "knex";
import { QuestionType } from "../src/dtos/users.dto";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.string('internship_program_id').nullable().references('id').inTable('internship_program').after('question');
        table.string('role_id').nullable().references('id').inTable('role').after('question');
        table.enu('question_type',Object.values(QuestionType)).nullable().after('question');
        table.integer('question_order').defaultTo(1).after('question');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('scoring_question', table => {
    table.dropColumn('internship_program_id');
    table.dropColumn('role_id');
    table.dropColumn('question_type');
    table.dropColumn('question_order');
  });
}
