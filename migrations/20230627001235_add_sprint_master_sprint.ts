import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.string('sprint_master_id').nullable().references('id').inTable('sprint_master');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('sprint', table => {
        table.dropColumn('sprint_master_id');
      });
}

