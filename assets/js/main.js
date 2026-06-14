const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));
}

const homeBrandLink = document.querySelector('.brand[href="#top"]');
if (homeBrandLink) {
  homeBrandLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (nav && toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
    if (window.location.hash) {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  });
}

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

if (observer) {
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

const COOKIE_NOTICE_KEY = 'michelaMoriniCookieNotice:v1';

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    /* Non blocca la navigazione se il browser limita lo storage locale. */
  }
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    /* Non blocca la navigazione se il browser limita lo storage locale. */
  }
}

function createCookieNotice() {
  if (safeStorageGet(COOKIE_NOTICE_KEY) || document.querySelector('.cookie-notice')) return;

  const notice = document.createElement('aside');
  notice.className = 'cookie-notice';
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-live', 'polite');
  notice.setAttribute('aria-label', 'Informativa cookie');
  notice.innerHTML = `
    <button class="cookie-notice-close" type="button" aria-label="Chiudi informativa cookie">×</button>
    <div class="cookie-notice-copy">
      <strong>Privacy e cookie</strong>
      <p>Questo sito usa solo strumenti tecnici necessari e un salvataggio locale per ricordare questa scelta. Non usa cookie di profilazione o analytics.</p>
    </div>
    <div class="cookie-notice-actions">
      <a href="cookie-policy.html">Leggi la Cookie Policy</a>
      <button type="button">Ho capito</button>
    </div>
  `;

  const closeNotice = () => {
    safeStorageSet(COOKIE_NOTICE_KEY, 'acknowledged');
    notice.classList.remove('is-visible');
    window.setTimeout(() => notice.remove(), 240);
  };

  notice.querySelector('.cookie-notice-actions button').addEventListener('click', closeNotice);
  notice.querySelector('.cookie-notice-close').addEventListener('click', closeNotice);
  document.body.appendChild(notice);
  requestAnimationFrame(() => notice.classList.add('is-visible'));
}

createCookieNotice();

document.querySelectorAll('[data-cookie-reset]').forEach((button) => {
  button.addEventListener('click', () => {
    safeStorageRemove(COOKIE_NOTICE_KEY);
    createCookieNotice();
  });
});
