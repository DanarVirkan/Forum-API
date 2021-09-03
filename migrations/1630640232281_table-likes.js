/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      references: '"comments"',
    },
    owner: {
      type: 'VARCHAR(50)',
      refrences: '"users"',
    },
  });
  pgm.createIndex('likes', 'comment_id');
  pgm.createIndex('likes', 'owner');
};

exports.down = (pgm) => {
  pgm.dropIndex('likes', 'comment_id');
  pgm.dropIndex('likes', 'owner');
  pgm.dropTable('likes');
};
