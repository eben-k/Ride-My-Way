import { createRide, ApiError } from '../apiClient.js';
import { requireAuth } from '../auth.js';

const token = requireAuth();

const form = document.getElementById('offer-form');
const message = document.getElementById('message');
const cancelButton = form.querySelector('.cancel');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

cancelButton.addEventListener('click', () => {
  form.reset();
  message.textContent = '';
  message.className = '';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  message.className = '';

  const car = document.getElementById('car').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const departureTimeLocal = document.getElementById('departureTime').value;
  const seats = Number(document.getElementById('seats').value);

  const departureTime = new Date(departureTimeLocal).toISOString();

  try {
    await createRide({
      car, from, to, departureTime, seats,
    }, token);
    window.location.href = 'rides.html';
  } catch (error) {
    showMessage(error instanceof ApiError ? error.message : 'Could not create the ride.', 'error');
  }
});
