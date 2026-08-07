import { signup, login, ApiError } from '../apiClient.js';
import { setToken } from '../auth.js';

const form = document.getElementById('signup-form');
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

  const name = document.getElementById('name').value;
  const phone = document.getElementById('number').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordRepeat = document.getElementById('password-repeat').value;

  if (password !== passwordRepeat) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  try {
    await signup({
      name, phone, username, email, password,
    });
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
