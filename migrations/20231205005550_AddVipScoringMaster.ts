import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_master', table => {
        table.boolean('is_vip').defaultTo(false);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('scoring_master', table => {
        table.dropColumn('is_vip');
    });
}

