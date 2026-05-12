exports.up = knex => knex.schema.createTable('office_locations', t => {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  t.string('name', 120).notNullable();
  t.decimal('latitude', 9, 6).notNullable();
  t.decimal('longitude', 9, 6).notNullable();
  t.integer('radius_m').defaultTo(100);
  t.boolean('is_active').defaultTo(true);
  t.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable('office_locations');
