/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply(id = 'reply-123', { content = 'isi balasan' }, owner, commentId, isDeleted = false) {
    const query = {
      text: 'INSERT INTO replies (id,content,owner,comment_id,is_deleted) VALUES ($1,$2,$3,$4,$5)',
      values: [id, content, owner, commentId, isDeleted],
    };
    await pool.query(query);
  },
  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await pool.query(query);
    return result.rows;
  },
  async cleanTable() {
    const query = {
      text: 'DELETE FROM replies WHERE 1 = 1',
    };
    await pool.query(query);
  },
};
module.exports = RepliesTableTestHelper;
