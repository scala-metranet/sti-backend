import { Knex } from "knex";
import { PartnerType } from "../src/dtos/users.dto";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('campus', table => {
        table.enu('type', Object.values(PartnerType)).defaultTo('universitas');
        table.string('faculty').nullable();
        table.string('major').nullable();
        table.specificType('major_list', 'varchar[]').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('campus', table => {
    table.dropColumn('type');
    table.dropColumn('faculty');
    table.dropColumn('major');
    table.dropColumn('major_list');
  });
}
