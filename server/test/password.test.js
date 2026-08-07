import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../auth/password.js';

describe('password hashing', () => {
  it('produces a salt:hash formatted string', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.equal(hash.split(':').length, 2);
  });

  it('produces a different hash each time for the same password', async () => {
    const first = await hashPassword('correct horse battery staple');
    const second = await hashPassword('correct horse battery staple');
    assert.notEqual(first, second);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.equal(await verifyPassword('wrong password', hash), false);
  });
});
