import {
  getRides, getRideRequests, getMyRequests, updateRequestStatus, ApiError,
} from '../apiClient.js';
import { requireAuth, parseJwtPayload, clearToken } from '../auth.js';

const token = requireAuth();

const message = document.getElementById('message');
const givenList = document.getElementById('given-list');
const takenList = document.getElementById('taken-list');
const givenCount = document.getElementById('given-count');
const takenCount = document.getElementById('taken-count');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function handleAuthError(error) {
  if (error instanceof ApiError && error.status === 401) {
    clearToken();
    window.location.href = 'signin.html';
    return true;
  }
  return false;
}

function rideSummary(ride) {
  const departs = new Date(ride.departureTime).toLocaleString();
  return `${ride.car} — ${ride.from} to ${ride.to} — ${departs}`;
}

function statusBadge(status) {
  const badge = document.createElement('span');
  badge.className = `status-badge ${status}`;
  badge.textContent = status;
  return badge;
}

async function renderGivenRide(ride) {
  const item = document.createElement('li');
  item.textContent = rideSummary(ride);

  const requestsBox = document.createElement('div');
  item.append(requestsBox);

  try {
    const requests = await getRideRequests(ride.id, token);
    if (requests.length === 0) {
      const none = document.createElement('p');
      none.textContent = 'No requests yet.';
      requestsBox.append(none);
    } else {
      requests.forEach((req) => {
        const row = document.createElement('div');
        row.className = 'request-item';

        const label = document.createElement('span');
        label.textContent = req.passengerName;

        row.append(label, statusBadge(req.status));

        if (req.status === 'pending') {
          const acceptBtn = document.createElement('button');
          acceptBtn.textContent = 'Accept';
          acceptBtn.className = 'btn-small';
          acceptBtn.addEventListener('click', () => respondToRequest(ride.id, req.id, 'accepted'));

          const rejectBtn = document.createElement('button');
          rejectBtn.textContent = 'Reject';
          rejectBtn.className = 'btn-small cancel';
          rejectBtn.addEventListener('click', () => respondToRequest(ride.id, req.id, 'rejected'));

          row.append(acceptBtn, rejectBtn);
        }

        requestsBox.append(row);
      });
    }
  } catch (error) {
    if (handleAuthError(error)) return;
    const errorEl = document.createElement('p');
    errorEl.textContent = 'Could not load requests for this ride.';
    requestsBox.append(errorEl);
  }

  givenList.append(item);
}

async function respondToRequest(rideId, requestId, status) {
  try {
    await updateRequestStatus(rideId, requestId, status, token);
    await loadProfile();
  } catch (error) {
    if (handleAuthError(error)) return;
    showMessage(error instanceof ApiError ? error.message : 'Could not update the request.', 'error');
  }
}

function renderTakenRide(req) {
  const item = document.createElement('li');
  const departs = new Date(req.departureTime).toLocaleString();
  item.textContent = `${req.car} — ${req.from} to ${req.to} — ${departs} — `;
  item.append(statusBadge(req.status));
  takenList.append(item);
}

async function loadProfile() {
  message.textContent = '';
  message.className = '';
  givenList.innerHTML = '';
  takenList.innerHTML = '';

  const { id: currentUserId } = parseJwtPayload(token);

  try {
    const [rides, myRequests] = await Promise.all([getRides(token), getMyRequests(token)]);

    const givenRides = rides.filter((ride) => ride.driverId === currentUserId);
    givenCount.textContent = givenRides.length;
    takenCount.textContent = myRequests.length;

    if (givenRides.length === 0) {
      const none = document.createElement('li');
      none.textContent = 'You haven’t offered any rides yet.';
      givenList.append(none);
    } else {
      await Promise.all(givenRides.map(renderGivenRide));
    }

    if (myRequests.length === 0) {
      const none = document.createElement('li');
      none.textContent = 'You haven’t requested to join any rides yet.';
      takenList.append(none);
    } else {
      myRequests.forEach(renderTakenRide);
    }
  } catch (error) {
    if (handleAuthError(error)) return;
    showMessage('Could not load your profile. Please try again later.', 'error');
  }
}

if (token) loadProfile();
