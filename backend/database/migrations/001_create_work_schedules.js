exports.up = knex => knex.schema.createTable('work_schedules', t => {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  t.string('name', 80).notNullable();
  t.time('shift_start').notNullable();
  t.time('shift_end').notNullable();
  t.integer('grace_minutes').defaultTo(10);
  t.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable('work_schedules');
