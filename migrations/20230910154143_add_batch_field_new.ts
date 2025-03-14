import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('batch_master', table => {
        table.string('onboard_date').nullable();
        table.string('registration_date').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('batch_master', table => {
        table.dropColumn('onboard_date');
        table.dropColumn('registration_date');
      });
}

