import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('date_in').nullable();
        table.string('date_out').nullable();
        table.string('pembimbing').nullable();
        table.string('pembimbing_email').nullable();
        table.float('ipk').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('date_in');
        table.dropColumn('date_out');
        table.dropColumn('pembimbing');
        table.dropColumn('pembimbing_email');
        table.dropColumn('ipk');
    });
}

