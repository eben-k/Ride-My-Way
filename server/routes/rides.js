import { Router } from 'express';
import {
  listRides, getRideById, createRide, addRequestToRide,
} from '../data/rideStore.js';
import { createRideSchema, joinRequestSchema } from '../validators/rideSchemas.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json(listRides());
});

router.get('/:id', (req, res) => {
  const ride = getRideById(Number(req.params.id));
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }
  res.status(200).json(ride);
});

router.post('/', (req, res) => {
  const { error, value } = createRideSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  const ride = createRide(value);
  res.status(201).json(ride);
});

router.post('/:id/requests', (req, res) => {
  const ride = getRideById(Number(req.params.id));
  if (!ride) {
    res.status(404).json({ message: `No ride found with id ${req.params.id}` });
    return;
  }

  const { error, value } = joinRequestSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const joinRequest = addRequestToRide(ride.id, value);
  res.status(201).json(joinRequest);
});

export default router;
