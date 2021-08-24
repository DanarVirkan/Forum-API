const NewComment = require('../../Domains/comments/entities/NewComment');
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
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
    const newComment = new NewComment(useCasePayload);
    const result = await this._commentRepository.addCommentByThreadId(newComment, userId, threadId);
    return result;
  }

  async deleteCommentById(commentId) {
    await this._commentRepository.deleteCommentById(commentId);
  }
}
module.exports = ThreadUseCase;
