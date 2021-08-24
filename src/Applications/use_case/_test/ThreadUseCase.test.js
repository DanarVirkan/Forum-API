const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

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

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    const addedComment = await getThreadUseCase
      .addCommentByThreadId(useCasePayload, userId, threadId);

    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addCommentByThreadId)
      .toBeCalledWith(new NewComment(useCasePayload), userId, threadId);
  });
  it('should orchestrating the delete comment action correctly', async () => {
    const commentId = 'comment-123';

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const getThreadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
    });

    await getThreadUseCase.deleteCommentById(commentId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(commentId);
  });
});
