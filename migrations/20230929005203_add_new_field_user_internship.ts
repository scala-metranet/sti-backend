import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.float('screening_score').defaultTo(0);
        table.float('total_screening_score').defaultTo(0);
        table.float('self_interview_score').defaultTo(0);
        table.float('total_self_interview_score').defaultTo(0);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.dropColumn('screening_score');
        table.dropColumn('total_screening_score');
        table.dropColumn('self_interview_score');
        table.dropColumn('total_self_interview_score');
      });
}

