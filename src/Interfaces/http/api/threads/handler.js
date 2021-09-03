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
    this.likeCommentByIdHandler = this.likeCommentByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addedThread = await this._threadUseCase.addThread(request.payload, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentByThreadIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await this._threadUseCase
      .addCommentByThreadId(request.payload, { userId, threadId });
    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  }

  async postReplyByThreadAndCommentIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addedReply = await this._threadUseCase
      .addReplyByCommentAndThreadId(request.payload, { userId, commentId, threadId });
    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async getThreadByIdHandler(request) {
    const { threadId } = request.params;
    const thread = await this._threadUseCase.getThreadById(threadId);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }

  async deleteCommentByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { commentId, threadId } = request.params;
    await this._threadUseCase.deleteComment({ commentId, threadId, userId });
    return {
      status: 'success',
    };
  }

  async deleteReplyByIdHandler(request) {
    const { id } = request.auth.credentials;
    const { replyId, commentId, threadId } = request.params;

    await this._threadUseCase.deleteReply({
      replyId, commentId, threadId, userId: id,
    });
    return {
      status: 'success',
    };
  }

  async likeCommentByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await this._threadUseCase.likeCommentById({ threadId, commentId, userId });
    return {
      status: 'success',
    };
  }
}
module.exports = ThreadsHandler;
