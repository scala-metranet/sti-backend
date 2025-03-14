import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('graduation', table => {
        table.string('certificate').nullable();
        table.string('raport').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('graduation', table => {
        table.dropColumn('certificate');
        table.dropColumn('raport');
      });
}

