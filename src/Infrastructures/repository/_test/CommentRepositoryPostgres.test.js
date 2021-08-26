const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepository postgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepository = new CommentRepositoryPostgres({}, {});
    expect(commentRepository).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addCommentByThreadId function', () => {
      it('should add comment to database and return added comment correctly', async () => {
        const content = 'isi komentar';
        const newComment = new NewComment({
          content,
        });
        const fakeIdGenerator = () => '123';
        const fakeUserId = 'user-123';
        const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
        const threadId = 'thread-123';

        await UsersTableTestHelper.addUser({ id: fakeUserId });
        await ThreadTableTestHelper.addThread(threadId, {
          title: 'coba thread',
          body: 'isi thread',
        }, fakeUserId);

        const addedComment = await commentRepository
          .addCommentByThreadId(newComment, fakeUserId, threadId);

        const comment = await CommentsTableTestHelper.findCommentById('comment-123');
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content,
          owner: fakeUserId,
        }));
        expect(comment).toHaveLength(1);
        expect(comment[0].content).toBe(content);
      });
    });

    describe('getCommentByThreadId function', () => {
      it('should return comment from thread and it\'s owner username', async () => {
        const commentRepository = new CommentRepositoryPostgres(pool, {});
        const userId = 'user-123';
        const threadId = 'thread-123';
        const commentId = 'comment-123';

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

        await expect(commentRepository.getCommentByThreadId(threadId))
          .resolves.not.toThrowError(InvariantError);
      });
    });

    describe('getCommentOwner function', () => {
      it('should return comment owner if exist', async () => {
        const commentRepository = new CommentRepositoryPostgres(pool, {});
        const userId = 'user-123';
        const threadId = 'thread-123';
        const commentId = 'comment-123';

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

        const owner = await commentRepository.getCommentOwner(commentId);

        await expect(commentRepository.getCommentOwner(commentId))
          .resolves.not.toThrowError(NotFoundError);
        expect(owner).toEqual(userId);
      });
      it('should throw NotFoundError when comment not exist', async () => {
        const commentRepository = new CommentRepositoryPostgres(pool, {});

        await expect(commentRepository.getCommentOwner('comment-123')).rejects.toThrowError(NotFoundError);
      });
    });

    describe('deleteCommentById function', () => {
      it('should remove comment from database if available', async () => {
        const commentRepository = new CommentRepositoryPostgres(pool, {});
        const fakeId = 'comment-123';
        const fakeUserId = 'user-123';
        const fakeThreadId = 'thread-123';

        await UsersTableTestHelper.addUser({ id: fakeUserId });
        await ThreadTableTestHelper.addThread(fakeThreadId, {
          title: 'coba thread',
          body: 'isi thread',
        }, fakeUserId);

        await CommentsTableTestHelper
          .addComment(fakeId, { content: 'isi komentar' }, fakeUserId, fakeThreadId);
        await expect(commentRepository.deleteCommentById(fakeId))
          .resolves.not.toThrow(NotFoundError);
      });
      it('should throw error when remove comment with invalid commentId from database', async () => {
        const commentRepository = new CommentRepositoryPostgres(pool, {});
        const fakeId = 'comment-123';
        await expect(commentRepository.deleteCommentById(fakeId)).rejects.toThrow(NotFoundError);
      });
    });
  });
});
