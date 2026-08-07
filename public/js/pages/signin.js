import { login, ApiError } from '../apiClient.js';
import { setToken } from '../auth.js';

const form = document.getElementById('signin-form');
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

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const { token } = await login({ username, password });
    setToken(token);
    window.location.href = 'rides.html';
  } catch (error) {
    if (error instanceof ApiError) {
      showMessage(error.message, 'error');
    } else {
      showMessage('Something went wrong. Please try again.', 'error');
    }
  }
});
