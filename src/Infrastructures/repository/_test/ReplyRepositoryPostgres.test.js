const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepository postgres', () => {
  it('should be instance of ReplyRepository domain', () => {
    const replyRepository = new ReplyRepositoryPostgres({}, {});
    expect(replyRepository).toBeInstanceOf(ReplyRepository);
  });

  describe('behaviour test', () => {
    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
    afterAll(async () => {
      pool.end();
    });
    describe('addReplyByCommentId function', () => {
      it('should add reply in database when comment existed', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';
        const replyPayload = {
          content: 'isi balasan',
        };
        const idGenerator = () => '123';
        const replyRepository = new ReplyRepositoryPostgres(pool, idGenerator);

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

        const addedReply = await replyRepository
          .addReplyByCommentId(replyPayload, userId, commentId);
        const reply = await RepliesTableTestHelper.findReplyById('reply-123');

        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: replyPayload.content,
          owner: userId,
        }));
        expect(reply).toHaveLength(1);
        expect(reply[0].content).toBe(replyPayload.content);
      });
    });
    describe('getReplyByCommentId function', () => {
      it('should return replies by comment id from database and it\'s owner username', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';
        const replyId = 'reply-123';
        const replyPayload = {
          content: 'isi balasan',
        };
        const replyRepository = new ReplyRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await RepliesTableTestHelper.addReply(replyId, replyPayload, userId, commentId);

        const reply = await replyRepository.getReplyByCommentId(commentId);

        await expect(replyRepository.getReplyByCommentId(commentId))
          .resolves.not.toThrowError(NotFoundError);
        expect(reply).toHaveLength(1);
        expect(reply[0]).toHaveProperty('username');
        expect(reply[0].content).toBe(replyPayload.content);
      });
    });
    describe('getReplyOwner function', () => {
      it('should return replies owner from database', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';
        const replyId = 'reply-123';
        const replyRepository = new ReplyRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await RepliesTableTestHelper.addReply(replyId, {}, userId, commentId);

        const reply = await replyRepository.getReplyOwner(replyId);

        await expect(replyRepository.getReplyOwner(replyId))
          .resolves.not.toThrowError(NotFoundError);
        expect(reply).toEqual(userId);
      });
      it('should throw NotFoundError when reply not exist', async () => {
        const replyRepository = new ReplyRepositoryPostgres(pool, {});

        await expect(replyRepository.getReplyOwner('reply-123')).rejects.toThrowError(NotFoundError);
      });
    });
    describe('deleteReplyById function', () => {
      it('should delete replies by id from database when existed', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';
        const replyId = 'reply-123';
        const replyRepository = new ReplyRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await RepliesTableTestHelper.addReply(replyId, {}, userId, commentId);

        await expect(replyRepository.deleteReplyById(replyId))
          .resolves.not.toThrowError(NotFoundError);
      });
      it('should throw NotFoundError if replies not existed', async () => {
        const replyRepository = new ReplyRepositoryPostgres(pool, {});
        await expect(replyRepository.deleteReplyById('reply-123'))
          .rejects.toThrowError(NotFoundError);
      });
    });
  });
});
