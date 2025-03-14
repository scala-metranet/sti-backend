import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('expertise').nullable();
        table.string('expertise_duration').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('expertise');
        table.dropColumn('expertise_duration');
    });
}

