const API_BASE = window.__API_BASE__ || '';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim());
}

const Toast = (() => {
  const el = document.getElementById('toast');
  let timeoutId = null;

  function show(message, type = 'success', duration = 3400) {
    if (!el) return;

    el.textContent = message;
    el.classList.remove('error', 'show');
    if (type === 'error') el.classList.add('error');

    void el.offsetWidth;
    el.classList.add('show');

    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(hide, duration);
  }

  function hide() {
    if (!el) return;
    el.classList.remove('show');
  }

  return { show, hide };
})();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('subscribe-form');
  const email = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const consent = document.getElementById('consent');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (!form || !email || !emailError || !consent || !submitBtn || !formStatus) return;

  try {
    const stored = localStorage.getItem('newsletter_email');
    if (stored && isValidEmail(stored)) email.value = stored;
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  function setEmailError(message = '') {
    emailError.textContent = message;
    email.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function updateButtonState() {
    submitBtn.disabled = !(isValidEmail(email.value) && consent.checked);
  }

  function validateEmail({ showEmpty = false } = {}) {
    const value = email.value.trim();

    if (!value) {
      setEmailError(showEmpty ? 'Please enter your email address.' : '');
      return false;
    }

    if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }

    setEmailError('');
    return true;
  }

  email.addEventListener('input', () => {
    validateEmail();
    updateButtonState();
  });

  email.addEventListener('blur', () => {
    validateEmail({ showEmpty: false });
  });

  consent.addEventListener('change', updateButtonState);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateEmail({ showEmpty: true })) {
      email.focus();
      updateButtonState();
      return;
    }

    if (!consent.checked) {
      Toast.show('Please confirm that you agree to receive emails.', 'error');
      updateButtonState();
      return;
    }

    const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(
      (input) => input.value
    );
    const value = email.value.trim();

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    formStatus.textContent = 'Submitting subscription.';

    try {
      const response = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, interests, consent: true })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 429) {
          if (data?.error === 'EMAIL_RATE_LIMIT') {
            Toast.show('Mailtrap is rate-limiting emails. Please wait a few seconds and try again.', 'error');
          } else {
            Toast.show('Too many attempts. Please try again in a minute.', 'error');
          }
        } else if (data?.error === 'INVALID_EMAIL') {
          setEmailError('Please enter a valid email address.');
          email.focus();
        } else if (data?.error === 'CONSENT_REQUIRED') {
          Toast.show('Please confirm that you agree to receive emails.', 'error');
        } else {
          Toast.show('We could not subscribe you yet. Please try again.', 'error');
        }

        formStatus.textContent = 'Subscription failed.';
        return;
      }

      formStatus.textContent = 'Subscription successful.';
      Toast.show('You are subscribed. Check your inbox for the welcome email.');

      try {
        localStorage.setItem('newsletter_email', value);
      } catch {
        // Non-critical enhancement only.
      }

      form.reset();
      email.value = value;
      setEmailError('');
    } catch {
      formStatus.textContent = 'Network error.';
      Toast.show('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      updateButtonState();
      window.setTimeout(() => {
        formStatus.textContent = '';
      }, 2500);
    }
  });

  updateButtonState();
});
