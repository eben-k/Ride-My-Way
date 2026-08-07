import { Router } from 'express';
import { listRequestsForPassenger } from '../data/rideStore.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  res.status(200).json(await listRequestsForPassenger(req.user.id));
});

export default router;
