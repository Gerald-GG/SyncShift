exports.up = knex => knex.schema.createTable('users', t => {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  t.string('name', 120).notNullable();
  t.string('email', 255).notNullable().unique();
  t.string('phone', 30);
  t.text('password_hash').notNullable();
  t.enu('role', ['employee', 'admin', 'superadmin']).defaultTo('employee');
  t.uuid('schedule_id').references('id').inTable('work_schedules').onDelete('SET NULL');
  t.boolean('is_active').defaultTo(true);
  t.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable('users');
