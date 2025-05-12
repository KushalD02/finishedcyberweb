// public/js/auth.js

let csrfToken = '';

// Fetch initial CSRF token when page loads
fetch('/auth/csrf-token')
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
    document.querySelectorAll('#register-form button, #login-form button').forEach(btn => {
      btn.disabled = false;
    });
  })
  .catch(err => {
    console.error('Failed to fetch CSRF token:', err);
  });

// Register handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password })
    });

    const message = await res.text();
    alert(message);
  } catch (err) {
    console.error('Registration failed:', err);
    alert('Registration failed. Please try again.');
  }
});

// Login handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password })
    });

    const message = await res.text();
    alert(message);

    // If login is successful, fetch a new CSRF token
    if (res.ok && message.toLowerCase().includes('success')) {
      const csrfRes = await fetch('/auth/csrf-token');
      const csrfData = await csrfRes.json();
      csrfToken = csrfData.csrfToken;
      console.log('New CSRF token set:', csrfToken);
    }
  } catch (err) {
    console.error('Login failed:', err);
    alert('Login failed. Please try again.');
  }
});
