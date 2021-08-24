/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async addThread(id, { title = 'judul thread', body = 'isi thread' }, userId) {
    const query = {
      text: 'INSERT INTO threads (id,title,body,owner) VALUES($1,$2,$3,$4)',
      values: [id, title, body, userId],
    };
    await pool.query(query);
  },
  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadTableTestHelper;
