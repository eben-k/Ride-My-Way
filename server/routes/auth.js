import { Router } from 'express';
import { createUser, findUserByUsername } from '../data/userStore.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signToken } from '../auth/jwt.js';
import { signupSchema, loginSchema } from '../validators/authSchemas.js';

const UNIQUE_VIOLATION = '23505';

const router = Router();

router.post('/signup', async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const { password, ...profile } = value;
  const passwordHash = await hashPassword(password);

  try {
    const user = await createUser({ ...profile, passwordHash });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      res.status(409).json({ message: 'Username or email is already taken' });
      return;
    }
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const user = await findUserByUsername(value.username);
  if (!user || !(await verifyPassword(value.password, user.password_hash))) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const token = signToken({ id: user.id, username: user.username });
  res.status(200).json({ token });
});

export default router;
