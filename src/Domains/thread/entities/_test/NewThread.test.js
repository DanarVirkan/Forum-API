const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'abc',
    };
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'abc',
      body: 1223,
    };
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should create newUser object correctly', () => {
    const payload = {
      title: 'abc',
      body: 'abc',
    };
    const { title, body } = new NewThread(payload);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
