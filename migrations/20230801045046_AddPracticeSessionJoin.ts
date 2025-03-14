import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('join_request', table => {
        table.string('practice_session').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('join_request', table => {
        table.dropColumn('practice_session');
      });
}

