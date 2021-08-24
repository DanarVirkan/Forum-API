const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

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
      it('should throw InvariantError if thread not available', async () => {
        const threadRepository = new ThreadRepositoryPostgres(pool, {});
        await expect(threadRepository.getThreadById('thread-123'))
          .rejects.toThrow(InvariantError);
      });

      it('should not throw InvariantError if thread available', async () => {
        const threadId = 'thread-123';
        const userId = 'user-123';

        const threadRepository = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: userId });
        await ThreadTableTestHelper.addThread(threadId, {
          title: 'coba thread',
          body: 'isi thread',
        }, userId);

        await expect(threadRepository.getThreadById('thread-123'))
          .resolves.not.toThrow(InvariantError);
      });
    });
  });
});
