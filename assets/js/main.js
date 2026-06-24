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

const methodTabs = document.querySelectorAll('[data-method]');
const methodPanels = document.querySelectorAll('[data-method-panel]');

function keepActiveMethodTabVisible(methodKey) {
  if (!methodKey || !window.matchMedia('(max-width: 720px)').matches) return;

  const activeTab = document.querySelector(`[data-method="${methodKey}"]`);
  const tabsScroller = activeTab ? activeTab.closest('.methods-tabs') : null;
  if (!activeTab || !tabsScroller) return;

  const targetLeft = activeTab.offsetLeft - ((tabsScroller.clientWidth - activeTab.clientWidth) / 2);
  const maxLeft = tabsScroller.scrollWidth - tabsScroller.clientWidth;
  const nextLeft = Math.max(0, Math.min(targetLeft, maxLeft));

  tabsScroller.scrollTo({ left: nextLeft, behavior: 'smooth' });
}

function activateMethod(methodKey) {
  if (!methodKey || !methodTabs.length || !methodPanels.length) return;

  methodTabs.forEach((tab) => {
    const isActive = tab.dataset.method === methodKey;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  methodPanels.forEach((panel) => {
    const isActive = panel.dataset.methodPanel === methodKey;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  window.requestAnimationFrame(() => keepActiveMethodTabVisible(methodKey));
  window.setTimeout(() => keepActiveMethodTabVisible(methodKey), 180);
}

methodTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activateMethod(tab.dataset.method);
    const targetPanel = document.querySelector(`[data-method-panel="${tab.dataset.method}"]`);
    if (targetPanel && window.history && window.history.replaceState) {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}#${targetPanel.id}`);
    }
  });
});

document.querySelectorAll('[data-method-target]').forEach((link) => {
  link.addEventListener('click', () => activateMethod(link.dataset.methodTarget));
});

function activateMethodFromHash() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target && target.dataset && target.dataset.methodPanel) {
    activateMethod(target.dataset.methodPanel);
  }
}

activateMethodFromHash();
window.addEventListener('hashchange', activateMethodFromHash);

const aboutCard = document.querySelector('#chisono .about-copy-card');
if (aboutCard) {
  const aboutDetails = Array.from(aboutCard.querySelectorAll('details.about-detail'));
  const syncAboutOpenState = () => {
    aboutCard.classList.toggle('about-has-open-detail', aboutDetails.some((detail) => detail.open));
  };

  aboutDetails.forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        aboutDetails.forEach((otherDetail) => {
          if (otherDetail !== detail) otherDetail.open = false;
        });
      }
      syncAboutOpenState();
    });
  });

  syncAboutOpenState();
}

// Patch Chi sono: un solo pannello compatto per card e sezioni espandibili.
const aboutTopicButtons = Array.from(document.querySelectorAll('#chisono [data-about-topic]'));
const aboutFocusPanel = document.querySelector('#about-focus-panel');
const aboutTopicContents = document.querySelector('#chisono .about-topic-contents');

if (aboutTopicButtons.length && aboutFocusPanel && aboutTopicContents) {
  const kicker = aboutFocusPanel.querySelector('.about-focus-kicker');
  const title = aboutFocusPanel.querySelector('h3');
  const body = aboutFocusPanel.querySelector('.about-focus-text');

  const setAboutTopic = (topic, shouldFocus = false) => {
    const content = aboutTopicContents.querySelector(`[data-about-content="${topic}"]`);
    if (!content || !kicker || !title || !body) return;

    kicker.textContent = content.dataset.kicker || '';
    title.textContent = content.dataset.title || '';
    body.innerHTML = content.innerHTML;

    aboutTopicButtons.forEach((button) => {
      const isActive = button.dataset.aboutTopic === topic;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    if (shouldFocus) {
      aboutFocusPanel.focus({ preventScroll: true });
    }
  };

  aboutTopicButtons.forEach((button) => {
    button.addEventListener('click', () => setAboutTopic(button.dataset.aboutTopic, true));
  });
}

// Patch Chi sono v2: card compatte + dettaglio in sovraimpressione.
(() => {
  const section = document.querySelector('#chisono');
  if (!section) return;

  const card = section.querySelector('.about-copy-card');
  const buttons = Array.from(section.querySelectorAll('[data-about-topic]'));
  const overlay = section.querySelector('#about-overlay-panel');
  const contents = section.querySelector('.about-topic-contents');
  const closeButton = section.querySelector('.about-overlay-close');

  if (!card || !buttons.length || !overlay || !contents || !closeButton) return;

  const kicker = overlay.querySelector('.about-overlay-kicker');
  const title = overlay.querySelector('h3');
  const body = overlay.querySelector('.about-overlay-text');

  const setExpandedButton = (topic) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.aboutTopic === topic;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  };

  const closeOverlay = () => {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    card.classList.remove('about-overlay-open');
    document.body.classList.remove('about-modal-open');
    buttons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const openTopic = (topic) => {
    const content = contents.querySelector(`[data-about-content="${topic}"]`);
    if (!content || !kicker || !title || !body) return;

    kicker.textContent = content.dataset.kicker || 'Approfondimento';
    title.textContent = content.dataset.title || '';
    body.innerHTML = content.innerHTML;

    setExpandedButton(topic);
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    card.classList.add('about-overlay-open');
    document.body.classList.add('about-modal-open');
    closeButton.focus({ preventScroll: true });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      openTopic(button.dataset.aboutTopic);
    });
  });

  closeButton.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-visible')) {
      closeOverlay();
    }
  });
})();
