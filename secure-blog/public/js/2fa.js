let csrfToken = '';

// Step 1: Fetch CSRF token and enable buttons
fetch('/csrf-token')
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
    document.getElementById('setup-2fa').disabled = false;
    document.getElementById('verify-2fa').disabled = false;
  })
  .catch(err => {
    console.error('Failed to fetch CSRF token for 2FA:', err);
  });

// Step 2: Generate and display 2FA QR code
document.getElementById('setup-2fa').addEventListener('click', async () => {
  try {
    const res = await fetch('/auth/2fa/setup', {
      method: 'GET',
      headers: {
        'CSRF-Token': csrfToken
      }
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    const data = await res.json();

    // Display QR code and manual backup code
    const qrImage = document.getElementById('qr-code');
    qrImage.src = data.qr;
    qrImage.style.display = 'block';

    document.getElementById('manual-key').textContent = data.manualCode;
  } catch (err) {
    console.error('Error during 2FA setup:', err);
  }
});

// Step 3: Verify 6-digit token entered by user
document.getElementById('verify-2fa').addEventListener('click', async () => {
  const email = document.getElementById('2fa-email').value;
  const token = document.getElementById('2fa-token').value;

  try {
    const res = await fetch('/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, token })
    });

    const message = await res.text();
    alert(message);
  } catch (err) {
    console.error('Error verifying 2FA:', err);
  }
});
