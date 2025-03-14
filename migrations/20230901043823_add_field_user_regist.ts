import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('department').nullable();
        table.string('position').nullable();
        table.string('speaker_id').nullable().references('id').inTable('speaker');
        table.specificType('permission', 'varchar[]').nullable();
        table.specificType('info_source', 'varchar[]').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('department');
        table.dropColumn('position');
        table.dropColumn('speaker_id');
        table.dropColumn('permission');
      });
}

