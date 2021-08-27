class ThreadsHandler {
  constructor({ threadUseCase }) {
    this._threadUseCase = threadUseCase;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentByThreadIdHandler = this.postCommentByThreadIdHandler.bind(this);
    this.postReplyByThreadAndCommentIdHandler = this
      .postReplyByThreadAndCommentIdHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id, title, owner } = await this._threadUseCase.addThread(request.payload, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedThread: {
          id,
          title,
          owner,
        },
      },
    });
    response.code(201);
    return response;
  }

  async postCommentByThreadIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const { id, content, owner } = await this._threadUseCase
      .addCommentByThreadId(request.payload, userId, threadId);
    const response = h.response({
      status: 'success',
      data: {
        addedComment: {
          id,
          content,
          owner,
        },
      },
    }).code(201);
    return response;
  }

  async postReplyByThreadAndCommentIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await this._threadUseCase.getThreadById(threadId);
    const { id, content, owner } = await this._threadUseCase
      .addReplyByCommentId(request.payload, userId, commentId);
    const response = h.response({
      status: 'success',
      data: {
        addedReply: {
          id,
          content,
          owner,
        },
      },
    }).code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const {
      id, title, body, date, username,
    } = await this._threadUseCase.getThreadById(threadId);

    const comments = await this._threadUseCase.getCommentByThreadId(threadId);

    const mappedComments = await Promise.all(comments.map(async ({
      id: commentId, content, date: commentDate, username: commentUsername, is_deleted: deleted,
    }) => {
      const replies = await this._threadUseCase.getReplyByCommentId(commentId);
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

    return h.response({
      status: 'success',
      data: {
        thread: {
          id,
          title,
          body,
          date,
          username,
          comments: mappedComments,
        },
      },
    }).code(200);
  }

  async deleteCommentByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { commentId, threadId } = request.params;
    await this._threadUseCase.verifyComment(commentId, userId);
    await this._threadUseCase.deleteComment(commentId, threadId);
    return {
      status: 'success',
    };
  }

  async deleteReplyByIdHandler(request) {
    const { id } = request.auth.credentials;
    const { replyId, commentId, threadId } = request.params;

    await this._threadUseCase.verifyReply(replyId, id);
    await this._threadUseCase.deleteReply(replyId, commentId, threadId);
    return {
      status: 'success',
    };
  }
}
module.exports = ThreadsHandler;
