const NewComment = require('../../Domains/comments/entities/NewComment');
const NewReply = require('../../Domains/replies/entities/NewReply');
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async addThread(useCasePayload, userId) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread, userId);
  }

  async getThreadById(threadId) {
    const comments = await this._commentRepository.getCommentByThreadId(threadId);

    const mappedComment = await Promise.all(comments.map(async (comment) => {
      const replies = await this._replyRepository.getReplyByCommentId(comment.id);
      return {
        ...comment,
        replies,
      };
    }));

    const thread = await this._threadRepository.getThreadById(threadId);
    return {
      ...thread,
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

  async likeCommentById({ commentId, userId }) {
    const liked = await this._likeRepository.verifyLikedComment(commentId, userId);
    if (!liked) {
      await this._likeRepository.addLikeByCommentId(commentId, userId);
    } else {
      await this._likeRepository.deleteLikeByCommentId(commentId, userId);
    }
  }
}
module.exports = ThreadUseCase;
