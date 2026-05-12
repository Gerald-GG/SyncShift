exports.up = knex => knex.schema.createTable('refresh_tokens', t => {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
  t.text('token').notNullable().unique();
  t.specificType('expires_at', 'TIMESTAMPTZ').notNullable();
  t.boolean('revoked').defaultTo(false);
  t.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable('refresh_tokens');
