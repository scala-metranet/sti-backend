import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('leaderboard', table => {
        table.integer('attendance_score').defaultTo(0);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.dropColumn('attendance_score');
    });
}

