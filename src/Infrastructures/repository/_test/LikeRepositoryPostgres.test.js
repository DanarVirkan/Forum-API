const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('LikeRepository postgres', () => {
  it('should be instance of LikeRepository domain', () => {
    const likeRepository = new LikeRepositoryPostgres({}, {});
    expect(likeRepository).toBeInstanceOf(LikeRepository);
  });

  describe('behaviour test', () => {
    afterEach(async () => {
      await LikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });
    afterAll(async () => {
      await pool.end();
    });
    describe('addLikeByCommentId function', () => {
      it('should add like in database when thread and comment existed', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';

        const idGenerator = () => '123';
        const likeRepository = new LikeRepositoryPostgres(pool, idGenerator);

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadsTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);

        await likeRepository.addLikeByCommentId(commentId, userId);
        const like = await LikesTableTestHelper.getLikesById('like-123');

        expect(like).toHaveLength(1);
      });
    });
    describe('getLikeCountByCommentId function', () => {
      it('should return like count by comment id from database', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';

        const likeRepository = new LikeRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadsTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await LikesTableTestHelper.addLikes({ commentId, userId });

        const like = await likeRepository.getLikeCountByCommentId(commentId);

        expect(like).toEqual(1);
      });
    });
    describe('verifyLikedComment function', () => {
      it('should return true', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';

        const likeRepository = new LikeRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadsTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await LikesTableTestHelper.addLikes({ commentId, userId });

        const like = await likeRepository.verifyLikedComment(commentId, userId);

        expect(like).toEqual(1);
      });
      it('should return false', async () => {
        const likeRepository = new LikeRepositoryPostgres(pool, {});

        const like = await likeRepository.verifyLikedComment('comment-123', 'user-123');
        expect(like).toEqual(0);
      });
    });
    describe('deleteLikeByCommentId function', () => {
      it('should delete like by comment id and user id from database', async () => {
        const userId = 'user-123';
        const commentId = 'comment-123';
        const threadId = 'thread-123';
        const likeId = 'like-123';

        const likeRepository = new LikeRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadsTableTestHelper.addThread(threadId, {}, userId);
        await CommentsTableTestHelper.addComment(commentId, {}, userId, threadId);
        await LikesTableTestHelper.addLikes({ id: likeId, commentId, userId });

        await likeRepository.deleteLikeByCommentId(commentId, userId);

        const like = await LikesTableTestHelper.getLikesById(likeId);
        expect(like).toHaveLength(0);
      });
    });
  });
});
