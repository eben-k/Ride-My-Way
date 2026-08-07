import { getRides, ApiError } from '../apiClient.js';
import { requireAuth, clearToken } from '../auth.js';

const token = requireAuth();

const list = document.getElementById('rides');
const message = document.getElementById('message');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function renderRide(ride) {
  const item = document.createElement('li');

  const heading = document.createElement('h3');
  heading.textContent = `${ride.car} — ${ride.from} to ${ride.to}`;

  const details = document.createElement('p');
  const departs = new Date(ride.departureTime).toLocaleString();
  details.textContent = `Departs ${departs} · ${ride.seats} seats`;

  const link = document.createElement('a');
  link.href = `takeride.html?ride=${ride.id}`;
  link.textContent = 'View details & request to join';

  item.append(heading, details, link);
  return item;
}

async function loadRides() {
  try {
    const rides = await getRides(token);
    list.innerHTML = '';
    if (rides.length === 0) {
      showMessage('No rides available yet. Be the first to offer one!', 'success');
      return;
    }
    rides.forEach((ride) => list.append(renderRide(ride)));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken();
      window.location.href = 'signin.html';
      return;
    }
    showMessage('Could not load rides. Please try again later.', 'error');
  }
}

if (token) loadRides();
