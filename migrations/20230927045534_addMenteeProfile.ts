import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.string('city_id').references('id').inTable('city').nullable();
        table.string('province_id').references('id').inTable('province').nullable();
        table.string('address').nullable();

        table.string('residence_city_id').references('id').inTable('city').nullable();
        table.string('residence_province_id').references('id').inTable('province').nullable();
        table.string('residence_address').nullable();

        table.string('shirt_size').nullable();
        table.boolean('is_has_laptop').defaultTo(false).nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user', table => {
        table.dropColumn('city_id');
        table.dropColumn('province_id');
        table.dropColumn('address');

        table.dropColumn('residence_city_id');
        table.dropColumn('residence_province_id');
        table.dropColumn('residence_address');

        table.dropColumn('shirt_size');
        table.dropColumn('is_has_laptop');
      });
}

