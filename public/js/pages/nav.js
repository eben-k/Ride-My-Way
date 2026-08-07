import { getToken, clearToken, parseJwtPayload } from '../auth.js';

function renderAuthSlot() {
  const slot = document.getElementById('auth-slot');
  if (!slot) return;

  const token = getToken();
  if (!token) {
    slot.innerHTML = '<a href="signin.html">Sign In</a>';
    return;
  }

  let username;
  try {
    ({ username } = parseJwtPayload(token));
  } catch {
    clearToken();
    slot.innerHTML = '<a href="signin.html">Sign In</a>';
    return;
  }

  slot.innerHTML = `<span class="nav-user">Hi, ${username}</span><a href="#" id="signout-link">Sign Out</a>`;
  document.getElementById('signout-link').addEventListener('click', (event) => {
    event.preventDefault();
    clearToken();
    window.location.href = 'index.html';
  });
}

renderAuthSlot();
