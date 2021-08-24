/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'DATE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"',
    },
  });
  pgm.createIndex('comments', 'owner');
  pgm.createIndex('comments', 'thread_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('comments', 'owner');
  pgm.dropIndex('comments', 'thread_id');
  pgm.dropTable('comments');
};
