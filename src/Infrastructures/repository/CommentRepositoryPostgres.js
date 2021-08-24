const InvariantError = require('../../Commons/exceptions/InvariantError');
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

  async deleteCommentById(commentId) {
    const query = {
      text: 'DELETE FROM comments WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Comment is not found');
    }
  }
}
module.exports = CommentRepositoryPostgres;
