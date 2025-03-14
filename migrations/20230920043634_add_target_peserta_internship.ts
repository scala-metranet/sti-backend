import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.string('target_peserta').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.dropColumn('target_peserta');
      });
}

