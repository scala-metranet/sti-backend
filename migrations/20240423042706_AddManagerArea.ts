import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company_area', table => {
        table.string('nama_manager').nullable();
        table.string('jabatan').nullable();
        table.string('file_ttd').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('company_area', table => {
        table.dropColumn('nama_manager');
        table.dropColumn('jabatan');
        table.dropColumn('file_ttd');
    });
}

