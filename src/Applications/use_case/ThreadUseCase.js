const NewComment = require('../../Domains/comments/entities/NewComment');
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
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

  async getUsernameById(userId) {
    const result = await this._userRepository.getUsernameById(userId);
    return result;
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
}
module.exports = ThreadUseCase;
