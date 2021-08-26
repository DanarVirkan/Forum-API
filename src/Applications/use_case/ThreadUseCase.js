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
    const result = await this._threadRepository.getThreadById(threadId);
    return result;
  }

  async addCommentByThreadId(useCasePayload, userId, threadId) {
    await this._threadRepository.getThreadById(threadId);
    const newComment = new NewComment(useCasePayload);
    const result = await this._commentRepository.addCommentByThreadId(newComment, userId, threadId);
    return result;
  }

  async deleteCommentById(commentId) {
    await this._commentRepository.deleteCommentById(commentId);
  }

  async getCommentByThreadId(threadId) {
    const result = await this._commentRepository.getCommentByThreadId(threadId);
    return result;
  }

  async verifyComment(commentId, userId) {
    const owner = await this._commentRepository.getCommentOwner(commentId);
    if (owner !== userId) {
      throw new Error('THREAD.USE_CASE.NOT_THE_COMMENT_OWNER');
    }
  }

  async addReplyByCommentId(useCasePayload, userId, commentId) {
    const newReply = new NewReply(useCasePayload);
    const result = await this._replyRepository.addReplyByCommentId(newReply, userId, commentId);
    return result;
  }

  async getReplyByCommentId(replyId) {
    const result = await this._replyRepository.getReplyByCommentId(replyId);
    return result;
  }

  async deleteReplyById(replyId) {
    await this._replyRepository.deleteReplyById(replyId);
  }

  async verifyReply(replyId, userId) {
    const owner = await this._replyRepository.getReplyOwner(replyId);
    if (owner !== userId) {
      throw new Error('THREAD.USE_CASE.NOT_THE_REPLY_OWNER');
    }
  }
}
module.exports = ThreadUseCase;
