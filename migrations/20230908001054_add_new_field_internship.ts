import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.string('area').nullable();
        table.string('unit').nullable();
        table.string('onboard_date').nullable();
        table.string('registration_date').nullable();
        table.integer('quota_max').nullable();
        table.boolean('is_vip').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('internship', table => {
        table.dropColumn('area');
        table.dropColumn('unit');
        table.dropColumn('onboard_date');
        table.dropColumn('registration_date');
        table.dropColumn('quota_max');
        table.dropColumn('is_vip');
      });
}

