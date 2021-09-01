/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('replies', {
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
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
    },
    is_deleted: {
      type: 'BOOLEAN',
    },
  });
  pgm.createIndex('replies', 'owner');
  pgm.createIndex('replies', 'comment_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('replies', 'owner');
  pgm.dropIndex('replies', 'comment_id');
  pgm.dropTable('replies');
};
