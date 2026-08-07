import { getRide, requestToJoinRide, ApiError } from '../apiClient.js';
import { requireAuth, clearToken } from '../auth.js';

const token = requireAuth();

const detailsEl = document.getElementById('ride-details');
const message = document.getElementById('message');
const requestButton = document.getElementById('request-button');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function renderRide(ride) {
  detailsEl.innerHTML = '';

  const heading = document.createElement('h2');
  heading.textContent = ride.car;
  const from = document.createElement('p');
  from.textContent = `From: ${ride.from}`;
  const to = document.createElement('p');
  to.textContent = `To: ${ride.to}`;
  const departs = document.createElement('p');
  departs.textContent = `Departs: ${new Date(ride.departureTime).toLocaleString()}`;
  const seats = document.createElement('p');
  seats.textContent = `Available seats: ${ride.seats}`;

  detailsEl.append(heading, from, to, departs, seats);
}

function handleAuthError(error) {
  if (error instanceof ApiError && error.status === 401) {
    clearToken();
    window.location.href = 'signin.html';
    return true;
  }
  return false;
}

async function init() {
  const rideId = new URLSearchParams(window.location.search).get('ride');
  if (!rideId) {
    showMessage('No ride selected.', 'error');
    return;
  }

  let ride;
  try {
    ride = await getRide(rideId, token);
  } catch (error) {
    if (handleAuthError(error)) return;
    showMessage(error instanceof ApiError ? error.message : 'Could not load this ride.', 'error');
    return;
  }

  renderRide(ride);
  requestButton.disabled = false;

  requestButton.addEventListener('click', async () => {
    requestButton.disabled = true;
    try {
      await requestToJoinRide(ride.id, token);
      showMessage('Request sent! The driver will respond soon.', 'success');
    } catch (error) {
      if (handleAuthError(error)) return;
      showMessage(error instanceof ApiError ? error.message : 'Could not send the request.', 'error');
      requestButton.disabled = false;
    }
  });
}

if (token) init();
