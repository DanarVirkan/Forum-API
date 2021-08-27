const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');

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
    const userId = 'user-123';
    const expectedAddedThread = new AddedThread({
      id: threadId,
      title: 'coba thread',
      owner: userId,
    });
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));
    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const getThread = await getThreadUseCase.getThreadById(threadId);

    expect(getThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
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
      .addCommentByThreadId(useCasePayload, userId, threadId);

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addCommentByThreadId)
      .toBeCalledWith(new NewComment(useCasePayload), userId, threadId);
  });
  it('should orchestrating the delete comment action correctly', async () => {
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.deleteComment(commentId, threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(commentId);
  });
  it('should orchestrating the get comment by threadId action correctly', async () => {
    const threadId = 'thread-123';
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.getCommentByThreadId(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });
  it('should orchestrating the verify comment action correctly', async () => {
    const commentId = 'comment-123';
    const userId = 'user-123';
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    await expect(getThreadUseCase.verifyComment(commentId, userId))
      .resolves.not.toThrowError('THREAD.USE_CASE.NOT_THE_COMMENT_OWNER');
  });
  it('should throw error when comment owner is not same as userId', async () => {
    const commentId = 'comment-123';
    const userId = 'user-123';
    const commentOwner = 'user-666';
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(commentOwner));

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    await expect(getThreadUseCase.verifyComment(commentId, userId))
      .rejects.toThrowError('THREAD.USE_CASE.NOT_THE_COMMENT_OWNER');
  });
  it('should orchestrating the add reply by commentId and threadId action correctly', async () => {
    const userId = 'user-123';
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

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(addedReply));
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.addReplyByCommentId(newReply, userId, commentId);
    expect(mockReplyRepository.addReplyByCommentId).toBeCalledWith(newReply, userId, commentId);
  });
  it('should orchestrating the delete reply action correctly', async () => {
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

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await getThreadUseCase.deleteReply(replyId, commentId, threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentOwner).toBeCalledWith(commentId);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(replyId);
  });
  it('should orchestrating the get reply by commentId action correctly', async () => {
    const replyId = 'reply-123';
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      replyRepository: mockReplyRepository,
    });

    await getThreadUseCase.getReplyByCommentId(replyId);
    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(replyId);
  });
  it('should orchestrating the verify reply action correctly', async () => {
    const replyId = 'reply-123';
    const userId = 'user-123';
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      replyRepository: mockReplyRepository,
    });

    await expect(getThreadUseCase.verifyReply(replyId, userId))
      .resolves.not.toThrowError('THREAD.USE_CASE.NOT_THE_REPLY_OWNER');
  });
  it('should throw error when reply owner is not same as userId', async () => {
    const replyId = 'reply-123';
    const userId = 'user-123';
    const replyOwner = 'user-666';

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve(userId));

    const getThreadUseCase = new ThreadUseCase({
      replyRepository: mockReplyRepository,
    });

    await expect(getThreadUseCase.verifyReply(replyId, replyOwner))
      .rejects.toThrowError('THREAD.USE_CASE.NOT_THE_REPLY_OWNER');
  });
});
