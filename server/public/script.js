// Optional: set window.__API_BASE__ in index.html if backend is on a different origin.
  // Same-origin (server/public): leave as ''.
  const API_BASE = window.__API_BASE__ || '';

  // Utility: simple email validation
  function isValidEmail(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(String(value).trim());
  }

  // Toast system
  const Toast = (() => {
    let timeoutId = null;
    const el = document.getElementById('toast');

    function show(message, type = 'success', duration = 3200) {
      if (!el) return;
      el.textContent = message;
      el.classList.remove('error', 'show');
      if (type === 'error') el.classList.add('error');

      // Force reflow to restart animation
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

  // Main form logic
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('subscribe-form');
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const consent = document.getElementById('consent');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (!form) return;

    // Prefill email if remembered
    try {
      const stored = localStorage.getItem('newsletter_email');
      if (stored && isValidEmail(stored)) {
        email.value = stored;
      }
    } catch {}

    function updateButtonState() {
      const valid = isValidEmail(email.value);
      const hasConsent = consent.checked;
      submitBtn.disabled = !(valid && hasConsent);
    }

    function showEmailError(msg = '') {
      emailError.textContent = msg;
      email.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    // Real-time validation
    email.addEventListener('input', () => {
      const value = email.value.trim();
      if (!value) {
        showEmailError('');
      } else if (!isValidEmail(value)) {
        showEmailError('Please enter a valid email address.');
      } else {
        showEmailError('');
      }
      updateButtonState();
    });

    consent.addEventListener('change', updateButtonState);

    // Submit to backend
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const value = email.value.trim();
      if (!isValidEmail(value)) {
        showEmailError('Please enter a valid email address.');
        email.focus();
        updateButtonState();
        return;
      }

      if (!consent.checked) {
        Toast.show('Please accept the Privacy Policy to continue.', 'error');
        updateButtonState();
        return;
      }

      // Collect interests
      const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(
        (el) => el.value
      );

      // Start loading state
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      formStatus.textContent = 'Submitting…';

      try {
        const res = await fetch(`${API_BASE}/api/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value, interests, consent: true })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 429) {
            Toast.show('Too many requests. Please try again later.', 'error');
          } else {
            const reason = data?.error || 'UNKNOWN';
            if (reason === 'INVALID_EMAIL') {
              showEmailError('Please enter a valid email address.');
              email.focus();
            } else if (reason === 'CONSENT_REQUIRED') {
              Toast.show('Please accept the Privacy Policy to continue.', 'error');
            } else {
              Toast.show('Something went wrong. Please try again.', 'error');
            }
          }
          formStatus.textContent = 'Submission failed.';
          return;
        }

        // Success
        formStatus.textContent = 'Subscription successful!';
        Toast.show('You are subscribed! Check your inbox for a welcome email 🎉');

        try {
          localStorage.setItem('newsletter_email', value);
        } catch {}

        // Reset form except email (kept to show success)
        form.reset();
        email.value = value; // keep email after reset
        showEmailError('');
      } catch (err) {
        formStatus.textContent = 'Network error.';
        Toast.show('Network error. Please try again.', 'error');
      } finally {
        submitBtn.classList.remove('is-loading');
        updateButtonState();
        // Clear live region after a short delay to reduce SR verbosity
        setTimeout(() => (formStatus.textContent = ''), 2500);
      }
    });

    // Initial state
    updateButtonState();
  });