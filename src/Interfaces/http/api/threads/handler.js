class ThreadsHandler {
  constructor({ threadUseCase }) {
    this._threadUseCase = threadUseCase;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentByThreadIdHandler = this.postCommentByThreadIdHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
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

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const {
      id, title, body, date, owner,
    } = await this._threadUseCase.getThreadById(threadId);

    const username = await this._threadUseCase.getUsernameById(owner);
    const comments = await this._threadUseCase.getCommentByThreadId(threadId);

    const mappedComments = await Promise.all(comments.map(async ({
      id: commentId, content, date: commentDate, owner: commentOwner, is_deleted: deleted,
    }) => {
      const commentUsername = await this._threadUseCase.getUsernameById(commentOwner);
      return {
        id: commentId, username: commentUsername, date: commentDate, content: deleted ? '**komentar telah dihapus**' : content,
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
    const { commentId } = request.params;
    await this._threadUseCase.verifyComment(commentId, userId);
    await this._threadUseCase.deleteCommentById(commentId);
    return {
      status: 'success',
    };
  }
}
module.exports = ThreadsHandler;
