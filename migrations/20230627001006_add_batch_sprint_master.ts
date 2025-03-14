import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.string('batch_master_id').nullable().references('id').inTable('batch_master');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.dropColumn('batch_master_id');
      });
}

