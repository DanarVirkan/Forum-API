const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply(id = 'reply-123', { content = 'isi balasan' }, owner, commentId) {
    const query = {
      text: 'INSERT INTO replies (id,content,owner,comment_id) VALUES ($1,$2,$3,$4)',
      values: [id, content, owner, commentId],
    };
    await pool.query(query);
  },
  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };
    return pool.query(query);
  },
  async cleanTable() {
    const query = {
      text: 'DELETE FROM replies WHERE 1 = 1',
    };
    await pool.query(query);
  },
};
module.exports = RepliesTableTestHelper;
