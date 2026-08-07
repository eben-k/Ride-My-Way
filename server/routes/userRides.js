import { Router } from 'express';
import {
  createRide, getRideById, listRequestsForRide, updateRequestStatus,
} from '../data/rideStore.js';
import { createRideSchema, requestStatusSchema } from '../validators/rideSchemas.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', async (req, res) => {
  const { error, value } = createRideSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const ride = await createRide({ driverId: req.user.id, ...value });
  res.status(201).json(ride);
});

router.get('/:id/requests', async (req, res) => {
  const rideId = Number(req.params.id);
  const ride = await getRideById(rideId);
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }
  if (ride.driverId !== req.user.id) {
    res.status(403).json({ message: 'Only the ride owner can view its requests' });
    return;
  }

  res.status(200).json(await listRequestsForRide(rideId));
});

router.put('/:id/requests/:requestId', async (req, res) => {
  const rideId = Number(req.params.id);
  const ride = await getRideById(rideId);
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }
  if (ride.driverId !== req.user.id) {
    res.status(403).json({ message: 'Only the ride owner can respond to its requests' });
    return;
  }

  const { error, value } = requestStatusSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const updated = await updateRequestStatus(rideId, Number(req.params.requestId), value.status);
  if (!updated) {
    res.status(404).json({ message: `No request found with id ${req.params.requestId}` });
    return;
  }

  res.status(200).json(updated);
});

export default router;
