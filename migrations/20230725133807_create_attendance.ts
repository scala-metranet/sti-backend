import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('attendance', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').references('id').inTable('user');
        table.string('tod_id').nullable().references('id').inTable('okr');
        table.string('tod').nullable();
        table.enu('health_status',['fit','not-well','sick']).nullable();
        table.enu('working_status',['wfo','wfh','wfa']).nullable();
        table.datetime('check_in').nullable();
        table.datetime('check_out').nullable();
        table.string('photo_in').nullable();
        table.string('photo_out').nullable();
        table.string('loc_in').nullable();
        table.string('loc_out').nullable();
        table.json('lng_lat_in').nullable();
        table.json('lng_lat_out').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attendance');
}
