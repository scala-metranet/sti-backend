import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('preference_program_id').references('id').inTable('internship_program').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('preference_program_id');
      });
}

