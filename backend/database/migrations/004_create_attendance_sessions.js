exports.up = knex => knex.schema.createTable('attendance_sessions', t => {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
  t.specificType('signed_in_at',  'TIMESTAMPTZ').notNullable();
  t.decimal('signed_in_lat',  9, 6);
  t.decimal('signed_in_lng',  9, 6);
  t.specificType('signed_out_at', 'TIMESTAMPTZ');
  t.decimal('signed_out_lat', 9, 6);
  t.decimal('signed_out_lng', 9, 6);
  t.decimal('hours_worked', 5, 2);
  t.boolean('is_late').defaultTo(false);
  t.text('note');
  t.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable('attendance_sessions');
