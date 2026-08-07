import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createUser, findUserByUsername, findUserById } from '../data/userStore.js';
import { resetDb } from './helpers/db.js';

const newUser = () => ({
  name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@rmw.com',
  phone: '5551234',
  passwordHash: 'salt:hash',
});

describe('userStore', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('creates a user and does not return the password hash', async () => {
    const user = await createUser(newUser());

    assert.equal(typeof user.id, 'number');
    assert.equal(user.username, 'ada');
    assert.equal('passwordHash' in user, false);
    assert.equal('password_hash' in user, false);
  });

  it('rejects a duplicate username', async () => {
    await createUser(newUser());
    await assert.rejects(() => createUser(newUser()));
  });

  it('finds a user by username, including the password hash', async () => {
    const created = await createUser(newUser());
    const found = await findUserByUsername('ada');

    assert.equal(found.id, created.id);
    assert.equal(found.password_hash, 'salt:hash');
  });

  it('returns undefined when the username is not found', async () => {
    const found = await findUserByUsername('unknown');
    assert.equal(found, undefined);
  });

  it('finds a user by id, without the password hash', async () => {
    const created = await createUser(newUser());
    const found = await findUserById(created.id);

    assert.equal(found.username, 'ada');
    assert.equal('password_hash' in found, false);
  });

  it('returns undefined when the id is not found', async () => {
    const found = await findUserById(999999);
    assert.equal(found, undefined);
  });
});
