const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('ThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const fakeUserId = 'user-123';
    const useCasePayload = {
      title: 'coba thread',
      body: 'ini isi thread',
    };
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: fakeUserId,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await getThreadUseCase.addThread(useCasePayload, fakeUserId);

    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }), fakeUserId);
  });
  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-123';

    const expectedThread = {
      id: threadId,
      title: 'Coba Judul',
      body: 'isi thread',
      username: 'dicoding',
    };

    const arrayComment = [{
      id: 'comment-123',
      username: 'dicoding',
    }, {
      id: 'comment-666',
      username: 'dicoding',
    }];

    const arrayReply = [{
      id: 'reply-123',
      username: 'dicoding',
    }, {
      id: 'reply-666',
      username: 'dicoding',
    }];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(arrayComment));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(arrayReply));

    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    await getThreadUseCase.getThreadById(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });
  it('should orchestrating the add comment action correctly', async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    const useCasePayload = {
      content: 'isi komentar',
    };
    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: userId,
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedComment = await getThreadUseCase
      .addCommentByThreadId(useCasePayload, { userId, threadId });

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addCommentByThreadId)
      .toBeCalledWith(new NewComment(useCasePayload), userId, threadId);
  });
  it('should orchestrating the delete comment action correctly', async () => {
    const userId = 'user-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.deleteComment({ commentId, threadId, userId });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(commentId);
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(commentId);
  });
  it('should throw error when not the owner deleting comment', async () => {
    const userId = 'user-123';
    const fakeId = 'user-666';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(getThreadUseCase.deleteComment({ commentId, threadId, fakeId }))
      .rejects.toThrowError(Error);
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(commentId);
  });
  it('should orchestrating the add reply by commentId and threadId action correctly', async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const replyPayload = {
      content: 'isi balasan',
    };
    const addedReply = new AddedReply({
      id: replyId,
      content: replyPayload.content,
      owner: userId,
    });
    const newReply = new NewReply(replyPayload);

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(addedReply));
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.addReplyByCommentAndThreadId(newReply, { userId, commentId, threadId });
    expect(mockReplyRepository.addReplyByCommentId).toBeCalledWith(newReply, userId, commentId);
  });
  it('should orchestrating the delete reply action correctly', async () => {
    const userId = 'user-123';
    const replyId = 'reply-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.getReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await getThreadUseCase.deleteReply({
      replyId, commentId, threadId, userId,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(commentId);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(replyId);
  });

  it('should orchestrating the like comment action (like) correctly', async () => {
    const userId = 'user-123';
    const commentId = 'comment-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.addLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    const getThreadUseCase = new ThreadUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.likeCommentById({ commentId, userId });
    expect(mockLikeRepository.verifyLikedComment).toBeCalledWith(commentId, userId);
    expect(mockLikeRepository.addLikeByCommentId).toBeCalledWith(commentId, userId);
  });

  it('should orchestrating the like comment action (unlike) correctly', async () => {
    const userId = 'user-123';
    const commentId = 'comment-123';

    const mockLikeRepository = new LikeRepository();
    mockLikeRepository.addLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.likeCommentById({ commentId, userId });
    expect(mockLikeRepository.verifyLikedComment).toBeCalledWith(commentId, userId);
    expect(mockLikeRepository.deleteLikeByCommentId).toBeCalledWith(commentId, userId);
  });
});
