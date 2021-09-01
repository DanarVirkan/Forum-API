const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyByCommentId(newReply, owner, commentId) {
    const id = `reply-${this._idGenerator()}`;
    const { content } = newReply;
    const query = {
      text: 'INSERT INTO replies (id,content,owner,comment_id) VALUES ($1,$2,$3,$4) RETURNING id,content,owner',
      values: [id, content, owner, commentId],
    };
    const result = await this._pool.query(query);
    return new AddedReply({
      ...result.rows[0],
    });
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: 'SELECT replies.*,users.username AS username FROM replies JOIN users ON replies.owner = users.id WHERE replies.comment_id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getReplyOwner(replyId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }
    return result.rows[0].owner;
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }
  }
}
module.exports = ReplyRepositoryPostgres;
