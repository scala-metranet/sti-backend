import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.float('challenge_score').defaultTo(0);
        table.float('total_challenge_score').defaultTo(100);
        table.float('total_score').defaultTo(0);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.dropColumn('challenge_score');
        table.dropColumn('total_challenge_score');
        table.dropColumn('total_score');
      });
}

