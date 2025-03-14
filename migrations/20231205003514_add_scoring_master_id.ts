import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.string('scoring_master_id').references('id').inTable('scoring_master');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_question', table => {
        table.dropColumn('scoring_master_id');
    });
}

