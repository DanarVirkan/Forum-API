const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const injections = require('../../injections');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted threads', async () => {
      const userId = 'user-123';
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };

      await UsersTableTestHelper.addUser({ id: userId });

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });
  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comments', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const requestPayload = {
        content: 'isi komentar',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, { }, userId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentTableTestHelper.addComment(commentId, {}, userId, threadId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
  describe('when GET /threads/{threadId}', () => {
    it('should response 200', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment('comment-123', {}, userId, threadId);
      await CommentsTableTestHelper.addComment('comment-666', {}, userId, threadId, true);
      await RepliesTableTestHelper.addReply('reply-123', {}, userId, 'comment-123');
      await RepliesTableTestHelper.addReply('reply-666', {}, userId, 'comment-123', true);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].date).toBeDefined();

      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
    });
  });
  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 when thread or comment exist', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
    it('should response 404 when thread not exist', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 404 when comment not exist', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 401 when unauthorized', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply exist', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
      await RepliesTableTestHelper.addReply(replyId, payload, userId, commentId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
    it('should response 404 when reply not exist', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: userId,
          },
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 401 when unauthorized', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
      await RepliesTableTestHelper.addReply(replyId, payload, userId, commentId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      expect(response.statusCode).toEqual(401);
    });
    it('should response 403 when when reply owner is not the user', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const fakeId = 'user-666';
      const payload = {
        content: 'isi balasan',
      };

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread(threadId, {}, userId);
      await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
      await RepliesTableTestHelper.addReply(replyId, payload, userId, commentId);

      const server = await createServer(injections);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        auth: {
          strategy: 'forum_jwt',
          credentials: {
            id: fakeId,
          },
        },
      });

      expect(response.statusCode).toEqual(403);
    });
  });
});
