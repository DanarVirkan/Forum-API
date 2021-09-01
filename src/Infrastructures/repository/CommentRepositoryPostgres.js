const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentByThreadId(newComment, owner, threadId) {
    const id = `comment-${this._idGenerator()}`;
    const { content } = newComment;
    const query = {
      text: 'INSERT INTO comments (id,content,owner,thread_id) VALUES ($1,$2,$3,$4) RETURNING id,content,owner',
      values: [id, content, owner, threadId],
    };
    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: 'SELECT comments.*, users.username AS username FROM comments JOIN users ON comments.owner = users.id WHERE thread_id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getCommentOwner(commentId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Comment is not found');
    }
    return result.rows[0].owner;
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Comment is not found');
    }
  }
}
module.exports = CommentRepositoryPostgres;
