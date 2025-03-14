import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('leaderboard', table => {
        table.string('sprint_master_id').nullable().references('id').inTable('sprint_master');
        table.string('batch_master_id').nullable().references('id').inTable('batch_master');
        table.string('month').nullable();
        table.string('year').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('leaderboard', table => {
        table.dropColumn('month');
        table.dropColumn('year');
        table.dropColumn('sprint_master_id');
        table.dropColumn('batch_master_id');
      });
}

