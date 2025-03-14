import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.string('scoring_master_id').nullable().references('id').inTable('scoring_master');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring', table => {
        table.dropColumn('scoring_master_id');
    });
}

