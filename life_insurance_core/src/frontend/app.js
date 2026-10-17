document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = document.getElementById('spinner');
  const alertBox = document.getElementById('alertBox');
  const alertMsg = document.getElementById('alertMsg');
  const alertIcon = document.getElementById('alertIcon');

  // Toggle Password Visibility
  let isPasswordVisible = false;
  togglePasswordBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';

    if (isPasswordVisible) {
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    } else {
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  });

  function showAlert(message, type = 'error') {
    alertBox.className = `alert ${type}`;
    alertMsg.innerHTML = message;

    if (type === 'error') {
      alertIcon.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      `;
    } else {
      alertIcon.innerHTML = `
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      `;
    }
    alertBox.classList.remove('hidden');
  }

  function hideAlert() {
    alertBox.classList.add('hidden');
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      btnText.textContent = 'Verifying credentials...';
      spinner.classList.remove('hidden');
    } else {
      btnText.textContent = 'Sign In to Core';
      spinner.classList.add('hidden');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showAlert('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = window.location.port === '3001' ? 'http://localhost:3000/api/login' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        const userObj = data.user || {};
        showAlert(`Login Successful! Welcome, <strong>${userObj.username || username}</strong> [${userObj.userGroup || 'Core User'}]. Redirecting... <a href="menu.html" style="color:#fff;text-decoration:underline;margin-left:6px;">Go &rarr;</a>`, 'success');
        sessionStorage.setItem('kinsure_user', JSON.stringify(userObj));
        setTimeout(() => {
          window.location.assign('menu.html');
        }, 500);
      } else {
        showAlert(data.message || 'Invalid username or password.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Unable to reach the Authentication service. Ensure server is running on port 3000.', 'error');
    } finally {
      setLoading(false);
    }
  });
});
