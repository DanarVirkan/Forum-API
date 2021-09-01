const NewComment = require('../../Domains/comments/entities/NewComment');
const NewReply = require('../../Domains/replies/entities/NewReply');
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(useCasePayload, userId) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread, userId);
  }

  async getThreadById(threadId) {
    const comments = await this._commentRepository.getCommentByThreadId(threadId);

    const mappedComment = await Promise.all(comments.map(async ({
      id: commentId, content, date: commentDate, username: commentUsername, is_deleted: deleted,
    }) => {
      const replies = await this._replyRepository.getReplyByCommentId(commentId);
      const mappedReplies = replies.map(({
        id: replyId,
        content: replyContent,
        date: replyDate,
        username: replyUsername,
        is_deleted: replyDeleted,
      }) => ({
        id: replyId, content: replyDeleted ? '**balasan telah dihapus**' : replyContent, date: replyDate, username: replyUsername,
      }));
      return {
        id: commentId, username: commentUsername, date: commentDate, replies: mappedReplies, content: deleted ? '**komentar telah dihapus**' : content,
      };
    }));

    const {
      id,
      title,
      body,
      date,
      username,
    } = await this._threadRepository.getThreadById(threadId);
    return {
      id,
      title,
      body,
      date,
      username,
      comments: mappedComment,
    };
  }

  async addCommentByThreadId(useCasePayload, { userId, threadId }) {
    await this._threadRepository.getThreadById(threadId);
    const newComment = new NewComment(useCasePayload);
    const result = await this._commentRepository.addCommentByThreadId(newComment, userId, threadId);
    return result;
  }

  async deleteComment({ commentId, threadId, userId }) {
    const owner = await this._commentRepository.getCommentOwner(commentId);
    if (owner !== userId) {
      throw new Error('THREAD.USE_CASE.NOT_THE_COMMENT_OWNER');
    }
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.deleteCommentById(commentId);
  }

  async addReplyByCommentAndThreadId(useCasePayload, { userId, commentId, threadId }) {
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentOwner(commentId);
    const newReply = new NewReply(useCasePayload);
    const result = await this._replyRepository.addReplyByCommentId(newReply, userId, commentId);
    return result;
  }

  async deleteReply({
    replyId, commentId, threadId, userId,
  }) {
    const owner = await this._replyRepository.getReplyOwner(replyId);
    if (owner !== userId) {
      throw new Error('THREAD.USE_CASE.NOT_THE_REPLY_OWNER');
    }
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentOwner(commentId);
    await this._replyRepository.deleteReplyById(replyId);
  }
}
module.exports = ThreadUseCase;
