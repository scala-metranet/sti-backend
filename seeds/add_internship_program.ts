import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('internship_program').del();

  // Inserts seed entries
  await knex('internship_program').insert([
    { id: 'ce845hyhg5t0awb32jp0', name: 'Digital Regional Internship' },
    { id: 'ce845hyhg5t0awb32jpg', name: 'Kerja Praktek Reguler' },
    { id: 'ce845hyhg5t0awb32jq0', name: 'Praktek Kerja Lapangan' },
  ]);
}
