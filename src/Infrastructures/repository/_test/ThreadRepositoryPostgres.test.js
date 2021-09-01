const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('ThreadRepository postgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepository = new ThreadRepositoryPostgres({}, {});
    expect(threadRepository).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should add thread to database and return added thread correctly', async () => {
        const body = 'isi thread';
        const newThread = new NewThread({
          title: 'coba thread',
          body,
        });
        const fakeIdGenerator = () => '123';
        const fakeUserId = 'user-123';
        const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        await UsersTableTestHelper.addUser({ id: fakeUserId });
        const addedThread = await threadRepository.addThread(newThread, fakeUserId);
        const { id: threadId } = addedThread;

        const thread = await ThreadTableTestHelper.findThreadById(threadId);
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-123',
          title: 'coba thread',
          owner: fakeUserId,
        }));
        expect(thread).toHaveLength(1);
        expect(thread[0].body).toBe(body);
      });
    });

    describe('getThreadById function', () => {
      it('should throw NotFoundError if thread not available', async () => {
        const threadRepository = new ThreadRepositoryPostgres(pool, {});
        await expect(threadRepository.getThreadById('thread-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if thread available', async () => {
        const threadId = 'thread-123';
        const userId = 'user-123';
        const payload = {
          id: threadId,
          title: 'coba thread',
          body: 'isi thread',
          username: 'userCoba',
        };

        const threadRepository = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: userId, username: payload.username });
        await ThreadTableTestHelper.addThread(threadId, {
          title: payload.title,
          body: payload.body,
        }, userId);

        const thread = await threadRepository.getThreadById('thread-123');

        await expect(threadRepository.getThreadById('thread-123'))
          .resolves.not.toThrow(NotFoundError);
        expect(thread).toHaveProperty('id');
        expect(thread).toHaveProperty('title');
        expect(thread).toHaveProperty('body');
        expect(thread).toHaveProperty('username');
        expect(thread).toHaveProperty('date');
      });
    });
  });
});
