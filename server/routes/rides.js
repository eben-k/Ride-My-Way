import { Router } from 'express';
import { listRides, getRideById, addRequestToRide } from '../data/rideStore.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  res.status(200).json(await listRides());
});

router.get('/:id', async (req, res) => {
  const ride = await getRideById(Number(req.params.id));
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }
  res.status(200).json(ride);
});

router.post('/:id/requests', async (req, res) => {
  const rideId = Number(req.params.id);
  const ride = await getRideById(rideId);
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }

  if (ride.driverId === req.user.id) {
    res.status(400).json({ message: 'You cannot request to join your own ride' });
    return;
  }

  const joinRequest = await addRequestToRide(rideId, { passengerId: req.user.id });
  res.status(201).json(joinRequest);
});

export default router;
