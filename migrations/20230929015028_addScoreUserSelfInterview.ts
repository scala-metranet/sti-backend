import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_self_interview_answer', table => {
        table.float('score').defaultTo(0);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_self_interview_answer', table => {
        table.dropColumn('score');
      });
}

