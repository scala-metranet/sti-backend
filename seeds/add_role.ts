import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('role').del();

  // Inserts seed entries
  await knex('role').insert([
    { id: 'ce08kddq0yzfb7mtskz0', name: 'Super Admin' },
    { id: 'ce08kddq0yzfb7mtskz1', name: 'Admin' },
    { id: 'ce08kddq0yzfb7mtskz2', name: 'Mentor' },
    { id: 'ce08kddq0yzfb7mtskz3', name: 'Mentee' },
  ]);
}
