const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLikes({ id = 'like-123', commentId, userId }) {
    const query = {
      text: 'INSERT INTO likes VALUES ($1,$2,$3)',
      values: [id, commentId, userId],
    };
    await pool.query(query);
  },

  async getLikesById(likeId) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [likeId],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    const query = {
      text: 'DELETE FROM likes WHERE 1=1',
    };
    await pool.query(query);
  },

};
module.exports = LikesTableTestHelper;
