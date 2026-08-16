/**
 * script.js — Main Portfolio Application Logic
 * Handles: Particle Canvas, Navigation, Edit Mode, CRUD Operations,
 *          Modals, Intersection Observers, Form Submission, Local Storage,
 *          Admin Authentication, Dark/Light Mode
 */

'use strict';

/* ============================================================
   ADMIN CREDENTIALS
   ─────────────────────────────────────────────────────────────
   To change your password or email, edit the values below.
   ============================================================ */
const ADMIN_CREDENTIALS = {
  email:    'saranr7367@gmail.com',
  password: 'lucifer4450C@1234@'
};

const MAX_ATTEMPTS    = 5;
const LOCKOUT_MS      = 5 * 60 * 1000;  // 5 minutes in milliseconds
const LOCKOUT_KEY     = 'admin_lockout_until';
const ATTEMPTS_KEY    = 'admin_attempts';
const SESSION_KEY     = 'admin_authenticated';
const CIRCUMFERENCE   = 2 * Math.PI * 28; // SVG ring circumference

/* ============================================================
   ADMIN LOGIN CONTROLLER
   ============================================================ */
function initAdminLogin() {
  const overlay     = document.getElementById('admin-login-overlay');
  const loginForm   = document.getElementById('login-form');
  const lockoutEl   = document.getElementById('login-lockout');
  const successEl   = document.getElementById('login-success');
  const loginBox    = document.getElementById('admin-login-box');
  const emailInput  = document.getElementById('login-email');
  const pwInput     = document.getElementById('login-password');
  const submitBtn   = document.getElementById('login-submit-btn');
  const cancelBtn   = document.getElementById('login-cancel-btn');
  const attemptBar  = document.getElementById('login-attempt-bar');
  const attemptsLeftEl = document.getElementById('attempts-left');
  const countdownEl = document.getElementById('lockout-countdown');
  const ringEl      = document.getElementById('lockout-ring-progress');
  const togglePwBtn = document.getElementById('toggle-password-btn');
  const pwEye       = document.getElementById('pw-eye');

  let lockoutInterval = null;

  /* ── Helpers ── */
  function getAttempts()   { return parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10); }
  function setAttempts(n)  { localStorage.setItem(ATTEMPTS_KEY, String(n)); }
  function getLockoutUntil() { return parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10); }
  function setLockoutUntil(ts) { localStorage.setItem(LOCKOUT_KEY, String(ts)); }
  function clearAttempts() { localStorage.removeItem(ATTEMPTS_KEY); localStorage.removeItem(LOCKOUT_KEY); }
  function isAuthenticated() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function markAuthenticated() { sessionStorage.setItem(SESSION_KEY, '1'); }

  function isLockedOut() {
    const until = getLockoutUntil();
    return until > Date.now();
  }

  /* ── Attempt Dots ── */
  function updateDots(usedCount) {
    document.querySelectorAll('.attempt-dot').forEach((dot, idx) => {
      dot.classList.remove('used', 'empty', 'active');
      const dotNum = idx + 1; // dots are 1-indexed
      if (dotNum <= usedCount) {
        dot.classList.add('used');
      } else {
        dot.classList.add('active');
      }
    });
  }

  /* ── Show lockout UI with countdown ring ── */
  function showLockout() {
    loginForm.style.display  = 'none';
    successEl.style.display  = 'none';
    lockoutEl.style.display  = 'block';

    const totalMs = LOCKOUT_MS;

    function tick() {
      const remaining = getLockoutUntil() - Date.now();
      if (remaining <= 0) {
        clearInterval(lockoutInterval);
        clearAttempts();
        // Reset dots
        updateDots(0);
        // Show form again
        lockoutEl.style.display = 'none';
        loginForm.style.display = 'block';
        attemptBar.style.display = 'none';
        emailInput.value = '';
        pwInput.value = '';
        submitBtn.disabled = false;
        return;
      }

      // Update countdown text
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      countdownEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Update SVG ring (drains from full to 0)
      const fraction = remaining / totalMs;
      const offset   = CIRCUMFERENCE * (1 - fraction);
      ringEl.style.strokeDashoffset = offset;

      // Update hint text
      const minsLeft = Math.ceil(remaining / 60000);
      document.getElementById('lockout-mins').textContent =
        minsLeft === 1 ? '1 minute' : `${minsLeft} minutes`;
    }

    tick();
    lockoutInterval = setInterval(tick, 1000);
  }

  /* ── Show login overlay ── */
  function showLogin() {
    overlay.style.display = '';
    emailInput.value = '';
    pwInput.value = '';
    attemptBar.style.display = 'none';
    lockoutEl.style.display = 'none';
    successEl.style.display = 'none';
    loginForm.style.display = 'block';
    submitBtn.disabled = false;
    updateDots(getAttempts());

    // If currently locked out, show lockout screen immediately
    if (isLockedOut()) {
      loginForm.style.display = 'none';
      showLockout();
    }

    // Focus email after short delay
    setTimeout(() => emailInput.focus(), 100);
  }

  function hideLogin() {
    overlay.style.display = 'none';
    clearInterval(lockoutInterval);
  }

  /* ── Shake animation ── */
  function shakeBox() {
    loginBox.classList.remove('shake');
    // Force reflow
    void loginBox.offsetWidth;
    loginBox.classList.add('shake');
    setTimeout(() => loginBox.classList.remove('shake'), 600);
  }

  /* ── Password visibility toggle ── */
  togglePwBtn.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    pwEye.textContent = isHidden ? '🙈' : '👁';
  });

  /* ── Cancel button ── */
  cancelBtn.addEventListener('click', hideLogin);

  /* ── Close on overlay click (outside box) ── */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideLogin();
  });

  /* ── Close on Escape ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') hideLogin();
  });

  /* ── Form Submit ── */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isLockedOut()) { showLockout(); return; }

    const emailVal = emailInput.value.trim().toLowerCase();
    const pwVal    = pwInput.value;

    // Simulate brief verification delay
    submitBtn.disabled = true;
    submitBtn.querySelector('.login-btn-text').style.display = 'none';
    submitBtn.querySelector('.login-btn-loader').style.display = 'inline';

    setTimeout(() => {
      submitBtn.querySelector('.login-btn-text').style.display = 'inline';
      submitBtn.querySelector('.login-btn-loader').style.display = 'none';

      const correctEmail = emailVal === ADMIN_CREDENTIALS.email.toLowerCase();
      const correctPw    = pwVal === ADMIN_CREDENTIALS.password;

      if (correctEmail && correctPw) {
        /* ✅ SUCCESS */
        clearAttempts();
        markAuthenticated();
        loginForm.style.display = 'none';
        successEl.style.display = 'block';
        showToast('Welcome, Admin! 🔓', 'success');

        setTimeout(() => {
          hideLogin();
          successEl.style.display = 'none';
          loginForm.style.display = 'block';
          // Now open the actual admin panel
          openAdminPanel();
        }, 1400);

      } else {
        /* ❌ WRONG */
        const prev = getAttempts();
        const now  = prev + 1;
        setAttempts(now);
        shakeBox();

        const remaining = MAX_ATTEMPTS - now;

        if (now >= MAX_ATTEMPTS) {
          /* Trigger lockout */
          setLockoutUntil(Date.now() + LOCKOUT_MS);
          updateDots(MAX_ATTEMPTS);
          showToast('🔒 Too many attempts — locked for 5 minutes!', 'error');
          setTimeout(() => {
            loginForm.style.display = 'none';
            showLockout();
          }, 300);
        } else {
          /* Show warning */
          submitBtn.disabled = false;
          updateDots(now);
          attemptBar.style.display = 'flex';
          attemptsLeftEl.textContent = remaining;
          pwInput.value = '';
          pwInput.focus();

          if (remaining === 1) {
            showToast('⚠️ Last attempt before 5-minute lockout!', 'error');
          } else {
            showToast(`❌ Wrong credentials — ${remaining} attempt${remaining > 1 ? 's' : ''} left`, 'error');
          }
        }
      }
    }, 700);
  });

  /* ── Expose showLogin so admin trigger can call it ── */
  window.showAdminLogin = showLogin;
  window.isAdminAuthenticated = isAuthenticated;
}

/* Placeholder — overwritten by initAdminPanel() */
window.openAdminPanel = function () {};

/* ============================================================
   MINIMAL FUTURISTIC BACKDROP ANIMATION
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  const glows = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    glows.length = 0;
    for (let i = 0; i < 6; i++) {
      glows.push({
        x: (i + 1) * (W / 7),
        y: H * (0.25 + (i % 3) * 0.2),
        r: W * (0.12 + i * 0.025),
        alpha: 0.08 + i * 0.012,
        drift: (Math.random() - 0.5) * 26,
      });
    }
  }

  function drawAtmosphere() {
    ctx.clearRect(0, 0, W, H);

    glows.forEach((glow, index) => {
      const x = glow.x + Math.sin((performance.now() * 0.00035) + index) * glow.drift;
      const y = glow.y + Math.cos((performance.now() * 0.00028) + index) * 18;
      const radial = ctx.createRadialGradient(x, y, 0, x, y, glow.r);
      radial.addColorStop(0, `rgba(123, 207, 126, ${glow.alpha})`);
      radial.addColorStop(0.45, `rgba(168, 217, 127, ${glow.alpha * 0.6})`);
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.strokeStyle = 'rgba(168, 217, 127, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = H * (0.15 + i * 0.18) + Math.sin(performance.now() * 0.0005 + i) * 18;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + Math.sin(i) * 8);
      ctx.stroke();
    }
  }

  function animate() {
    drawAtmosphere();
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize);
})();


/* ============================================================
   STATE — Load from localStorage or use defaults
   ============================================================ */
function loadState() {
  try {
    const saved = localStorage.getItem('portfolio_data_v2');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep clone defaults
}

function saveState() {
  try {
    localStorage.setItem('portfolio_data_v2', JSON.stringify(STATE));
    showToast('Changes saved! 💾', 'success');
  } catch (e) {
    showToast('Could not save changes.', 'error');
  }
}

const STATE = loadState();


/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getStatusClass(status) {
  const map = { 'Completed': 'status-completed', 'In Progress': 'status-in-progress', 'Ongoing': 'status-ongoing' };
  return map[status] || 'status-completed';
}

function makeTagsHTML(tags, cls = 'project-tag') {
  if (!tags || !tags.length) return '';
  return tags.map(t => `<span class="${cls}">${sanitize(t.trim())}</span>`).join('');
}


/* ============================================================
   NAVIGATION
   ============================================================ */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
}, { passive: true });

hamburger.addEventListener('click', () => {
  document.body.classList.toggle('nav-mobile-open');
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    document.body.classList.remove('nav-mobile-open');
  }
});

function updateActiveNav() {
  const sections = ['home', 'projects', 'writings', 'experience', 'contact'];
  const scrollY = window.scrollY + 150;
  let active = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) active = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
}


/* ============================================================
   PHOTO UPLOAD
   ============================================================ */
const photoContainer = document.getElementById('photo-container');
const photoUpload = document.getElementById('photo-upload');
const profilePhoto = document.getElementById('profile-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');

if (photoContainer) {
  photoContainer.style.cursor = 'default';
  photoContainer.setAttribute('title', 'Profile photo');
}

photoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    profilePhoto.src = ev.target.result;
    profilePhoto.style.display = 'block';
    photoPlaceholder.style.display = 'none';
    // Persist photo
    try { localStorage.setItem('portfolio_photo', ev.target.result); } catch(er) {}
    showToast('Photo updated! ✨', 'success');
  };
  reader.readAsDataURL(file);
});

// Load saved photo
(function loadPhoto() {
  try {
    const saved = localStorage.getItem('portfolio_photo');
    if (saved) {
      profilePhoto.src = saved;
      profilePhoto.style.display = 'block';
      photoPlaceholder.style.display = 'none';
    }
  } catch(e) {}
})();


/* ============================================================
   RENDER PROJECTS
   ============================================================ */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  grid.classList.add('reveal-stagger');

  if (!STATE.projects.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🔬</div>
      <p>No projects yet. Enable Edit Mode to add your first project!</p>
    </div>`;
    return;
  }

  STATE.projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-index', i);
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Project: ${p.title}`);
    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-category">${sanitize(p.category)}</span>
        <span class="project-status ${getStatusClass(p.status)}">${sanitize(p.status)}</span>
      </div>
      <div class="project-title">${sanitize(p.title)}</div>
      <div class="project-desc">${sanitize(p.description)}</div>
      <div class="project-tags">${makeTagsHTML(p.tags, 'project-tag')}</div>
      <div class="project-footer">
        <span class="project-year">📅 ${sanitize(p.year)}</span>
        ${p.link ? `<a class="project-link" href="${sanitize(p.link)}" target="_blank" rel="noopener">View →</a>` : ''}
      </div>
    `;
    card.addEventListener('click', () => {
      if (isEditMode) openProjectModal(i);
    });
    grid.appendChild(card);
  });

  if (isEditMode) setTimeout(observeReveal, 100);
}


/* ============================================================
   RENDER WRITINGS
   ============================================================ */
function renderWritings() {
  const list = document.getElementById('writings-list');
  list.innerHTML = '';
  list.classList.add('reveal-stagger');

  if (!STATE.writings.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📝</div>
      <p>No writings yet. Enable Edit Mode to add publications!</p>
    </div>`;
    return;
  }

  STATE.writings.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'writing-card';
    card.setAttribute('data-index', i);
    card.setAttribute('role', 'article');
    card.innerHTML = `
      <div class="writing-main">
        <div class="writing-meta">
          <span class="writing-type">${sanitize(w.type)}</span>
          <span class="writing-pub">📖 ${sanitize(w.publication)}</span>
          <span class="writing-date">${sanitize(w.date)}</span>
        </div>
        <div class="writing-title">${sanitize(w.title)}</div>
        <div class="writing-abstract">${sanitize(w.abstract)}</div>
        <div class="writing-tags">${makeTagsHTML(w.tags, 'writing-tag')}</div>
      </div>
      <div class="writing-side">
        ${w.link ? `<a class="writing-link-btn" href="${sanitize(w.link)}" target="_blank" rel="noopener">Read Paper →</a>` : ''}
      </div>
    `;
    card.addEventListener('click', () => {
      if (isEditMode) openWritingModal(i);
    });
    list.appendChild(card);
  });
}


/* ============================================================
   RENDER EXPERIENCE
   ============================================================ */
function renderExperience(tab) {
  const tabs = ['internship', 'work', 'entrepreneurial'];
  const toRender = tab ? [tab] : tabs;

  toRender.forEach(t => {
    const timeline = document.getElementById(`timeline-${t}`);
    timeline.innerHTML = '';
    const items = STATE.experience[t] || [];

    if (!items.length) {
      timeline.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">${t === 'internship' ? '🏢' : t === 'work' ? '💼' : '🚀'}</div>
        <p>No ${t} entries yet. Enable Edit Mode to add!</p>
      </div>`;
      return;
    }

    items.forEach((exp, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal';
      item.innerHTML = `
        <div class="timeline-card" data-tab="${t}" data-index="${i}">
          <div class="timeline-header">
            <span class="timeline-role">${sanitize(exp.role)}</span>
            <span class="timeline-duration">${sanitize(exp.duration)}</span>
          </div>
          <div class="timeline-org">${sanitize(exp.org)}</div>
          <div class="timeline-location">📍 ${sanitize(exp.location)}</div>
          <div class="timeline-desc">${sanitize(exp.description)}</div>
          <div class="timeline-skills">${exp.skills.map(s => `<span class="timeline-skill">${sanitize(s)}</span>`).join('')}</div>
        </div>
      `;
      item.querySelector('.timeline-card').addEventListener('click', () => {
        if (isEditMode) openExpModal(t, i);
      });
      timeline.appendChild(item);
    });
  });
}


/* ============================================================
   EXPERIENCE TABS
   ============================================================ */
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.exp-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panelId = `panel-${tab.dataset.tab}`;
    document.getElementById(panelId).classList.add('active');
    observeReveal();
  });
});


/* ============================================================
   INTERSECTION OBSERVER — Reveal Animations
   ============================================================ */
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal:not(.visible), .reveal-stagger:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}


/* ============================================================
   EDIT MODE
   ============================================================ */
let isEditMode = false;

// NOTE: toggleEditBtn is now the admin panel's checkbox — wired below in ADMIN PANEL section
const editBanner = document.getElementById('edit-banner');
const saveBtn = document.getElementById('save-changes-btn');
const exitBtn = document.getElementById('exit-edit-btn');
const addProjectBtn = document.getElementById('add-project-btn');
const addWritingBtn = document.getElementById('add-writing-btn');
const addTagBtn = document.getElementById('add-tag-btn');


function enterEditMode() {
  isEditMode = true;
  document.body.classList.add('edit-mode');
  editBanner.classList.add('visible');

  // Update admin panel UI
  const toggle = document.getElementById('admin-edit-toggle');
  const dot = document.getElementById('admin-status-dot');
  const statusText = document.getElementById('admin-status-text');
  if (toggle) toggle.checked = true;
  if (dot) dot.classList.add('active');
  if (statusText) statusText.textContent = 'Edit Mode ON';

  // Enable contenteditable for all editable elements
  document.querySelectorAll('[data-editable="true"]').forEach(el => {
    if (el.hasAttribute('contenteditable')) el.setAttribute('contenteditable', 'true');
  });

  // Show add buttons
  addProjectBtn.style.display = 'inline-flex';
  addWritingBtn.style.display = 'inline-flex';
  addTagBtn.style.display = 'inline-flex';
  document.querySelectorAll('.add-exp-btn').forEach(b => b.style.display = 'inline-flex');

  renderProjects();
  renderExperience();

  showToast('Edit Mode ON — Click any item to edit ✏️', 'success');
}

function exitEditMode() {
  isEditMode = false;
  document.body.classList.remove('edit-mode');
  editBanner.classList.remove('visible');

  // Update admin panel UI
  const toggle = document.getElementById('admin-edit-toggle');
  const dot = document.getElementById('admin-status-dot');
  const statusText = document.getElementById('admin-status-text');
  if (toggle) toggle.checked = false;
  if (dot) dot.classList.remove('active');
  if (statusText) statusText.textContent = 'View Mode';

  document.querySelectorAll('[data-editable="true"]').forEach(el => {
    if (el.hasAttribute('contenteditable')) el.setAttribute('contenteditable', 'false');
  });

  addProjectBtn.style.display = 'none';
  addWritingBtn.style.display = 'none';
  addTagBtn.style.display = 'none';
  document.querySelectorAll('.add-exp-btn').forEach(b => b.style.display = 'none');

  renderProjects();
  renderExperience();
  observeReveal();
}

// The old toggle button is gone; edit mode is now controlled from admin panel (see below)


saveBtn.addEventListener('click', () => {
  collectInlineEdits();
  saveState();
});

exitBtn.addEventListener('click', () => {
  collectInlineEdits();
  exitEditMode();
});

// Save editable page content, including changes made from the admin edit mode.
function saveInlineText(el) {
  const key = el.id || el.dataset.key;
  if (!key) return;
  const textEl = key === 'hero-badge'
    ? el.querySelector('span:not(.badge-dot)')
    : el;
  if (textEl) localStorage.setItem(`portfolio_text_${key}`, textEl.textContent.trim());
}

function saveHeroTags() {
  const tags = Array.from(document.querySelectorAll('#hero-tags-container .hero-tag'))
    .map(tag => tag.textContent.trim())
    .filter(Boolean);
  localStorage.setItem('portfolio_hero_tags', JSON.stringify(tags));
}

// Collect all inline edits when either Save button is pressed.
function collectInlineEdits() {
  document.querySelectorAll('[data-editable="true"]').forEach(saveInlineText);
  saveHeroTags();
}

// Persist a text edit as soon as focus leaves it.
document.addEventListener('focusout', (event) => {
  const editable = event.target.closest('[data-editable="true"]');
  if (!editable) return;
  saveInlineText(editable);
  if (editable.classList.contains('hero-tag')) saveHeroTags();
});

// Load saved inline text and tags.
function loadInlineTexts() {
  document.querySelectorAll('[data-editable="true"]').forEach(el => {
    const key = el.id || el.dataset.key;
    if (!key) return;
    const saved = localStorage.getItem(`portfolio_text_${key}`);
    if (!saved) return;
    const textEl = key === 'hero-badge'
      ? el.querySelector('span:not(.badge-dot)')
      : el;
    if (textEl) textEl.textContent = saved;
  });

  const savedTags = localStorage.getItem('portfolio_hero_tags');
  if (!savedTags) return;
  try {
    const tags = JSON.parse(savedTags);
    const container = document.getElementById('hero-tags-container');
    const addButton = document.getElementById('add-tag-btn');
    if (!Array.isArray(tags) || !container || !addButton) return;
    container.querySelectorAll('.hero-tag').forEach(tag => tag.remove());
    tags.forEach(text => {
      const tag = document.createElement('span');
      tag.className = 'hero-tag';
      tag.setAttribute('data-editable', 'true');
      tag.setAttribute('contenteditable', 'false');
      tag.textContent = text;
      container.insertBefore(tag, addButton);
    });
  } catch (e) {}
}


/* ============================================================
   ADD TAG (Edit Mode)
   ============================================================ */
addTagBtn.addEventListener('click', () => {
  const input = prompt('Enter new tag:');
  if (!input || !input.trim()) return;
  const tagsContainer = document.getElementById('hero-tags-container');
  const newTag = document.createElement('span');
  newTag.className = 'hero-tag';
  newTag.setAttribute('data-editable', 'true');
  newTag.setAttribute('contenteditable', 'true');
  newTag.textContent = input.trim();
  tagsContainer.insertBefore(newTag, addTagBtn);
  showToast(`Tag "${input.trim()}" added!`, 'success');
});


/* ============================================================
   PROJECT MODAL
   ============================================================ */
const projectModal = document.getElementById('project-modal');
addProjectBtn.addEventListener('click', () => openProjectModal(-1));
document.getElementById('pm-close').addEventListener('click', () => closeModal(projectModal));

function openProjectModal(index) {
  const isNew = index === -1;
  const p = isNew ? {} : STATE.projects[index];
  document.getElementById('pm-index').value = index;
  document.getElementById('pm-title-input').value = p.title || '';
  document.getElementById('pm-category').value = p.category || '';
  document.getElementById('pm-desc').value = p.description || '';
  document.getElementById('pm-tags').value = p.tags ? p.tags.join(', ') : '';
  document.getElementById('pm-link').value = p.link || '';
  document.getElementById('pm-status').value = p.status || 'Completed';
  document.getElementById('pm-year').value = p.year || new Date().getFullYear();
  document.getElementById('pm-delete').style.display = isNew ? 'none' : 'inline-flex';
  projectModal.style.display = '';
  document.getElementById('pm-title-input').focus();
}

document.getElementById('pm-save').addEventListener('click', () => {
  const index = parseInt(document.getElementById('pm-index').value);
  const proj = {
    title: document.getElementById('pm-title-input').value.trim(),
    category: document.getElementById('pm-category').value.trim(),
    description: document.getElementById('pm-desc').value.trim(),
    tags: document.getElementById('pm-tags').value.split(',').map(s => s.trim()).filter(Boolean),
    link: document.getElementById('pm-link').value.trim(),
    status: document.getElementById('pm-status').value,
    year: document.getElementById('pm-year').value.trim()
  };
  if (!proj.title) { showToast('Title is required!', 'error'); return; }
  if (index === -1) STATE.projects.push(proj);
  else STATE.projects[index] = proj;
  saveState();
  closeModal(projectModal);
  renderProjects();
  observeReveal();
});

document.getElementById('pm-delete').addEventListener('click', () => {
  const index = parseInt(document.getElementById('pm-index').value);
  if (index < 0) return;
  if (confirm('Delete this project?')) {
    STATE.projects.splice(index, 1);
    saveState();
    closeModal(projectModal);
    renderProjects();
  }
});


/* ============================================================
   WRITING MODAL
   ============================================================ */
const writingModal = document.getElementById('writing-modal');
addWritingBtn.addEventListener('click', () => openWritingModal(-1));
document.getElementById('wm-close').addEventListener('click', () => closeModal(writingModal));

function openWritingModal(index) {
  const isNew = index === -1;
  const w = isNew ? {} : STATE.writings[index];
  document.getElementById('wm-index').value = index;
  document.getElementById('wm-title-input').value = w.title || '';
  document.getElementById('wm-publication').value = w.publication || '';
  document.getElementById('wm-date').value = w.date || '';
  document.getElementById('wm-abstract').value = w.abstract || '';
  document.getElementById('wm-tags').value = w.tags ? w.tags.join(', ') : '';
  document.getElementById('wm-link').value = w.link || '';
  document.getElementById('wm-type').value = w.type || 'Research Paper';
  document.getElementById('wm-delete').style.display = isNew ? 'none' : 'inline-flex';
  writingModal.style.display = '';
  document.getElementById('wm-title-input').focus();
}

document.getElementById('wm-save').addEventListener('click', () => {
  const index = parseInt(document.getElementById('wm-index').value);
  const writing = {
    title: document.getElementById('wm-title-input').value.trim(),
    publication: document.getElementById('wm-publication').value.trim(),
    date: document.getElementById('wm-date').value.trim(),
    abstract: document.getElementById('wm-abstract').value.trim(),
    tags: document.getElementById('wm-tags').value.split(',').map(s => s.trim()).filter(Boolean),
    link: document.getElementById('wm-link').value.trim(),
    type: document.getElementById('wm-type').value
  };
  if (!writing.title) { showToast('Title is required!', 'error'); return; }
  if (index === -1) STATE.writings.push(writing);
  else STATE.writings[index] = writing;
  saveState();
  closeModal(writingModal);
  renderWritings();
  observeReveal();
});

document.getElementById('wm-delete').addEventListener('click', () => {
  const index = parseInt(document.getElementById('wm-index').value);
  if (index < 0) return;
  if (confirm('Delete this writing?')) {
    STATE.writings.splice(index, 1);
    saveState();
    closeModal(writingModal);
    renderWritings();
  }
});


/* ============================================================
   EXPERIENCE MODAL
   ============================================================ */
const expModal = document.getElementById('exp-modal');
document.getElementById('em-close').addEventListener('click', () => closeModal(expModal));

document.querySelectorAll('.add-exp-btn').forEach(btn => {
  btn.addEventListener('click', () => openExpModal(btn.dataset.tab, -1));
});

function openExpModal(tab, index) {
  const isNew = index === -1;
  const exp = isNew ? {} : (STATE.experience[tab] || [])[index];
  document.getElementById('em-index').value = index;
  document.getElementById('em-tab').value = tab;
  document.getElementById('em-role').value = exp ? (exp.role || '') : '';
  document.getElementById('em-org').value = exp ? (exp.org || '') : '';
  document.getElementById('em-duration').value = exp ? (exp.duration || '') : '';
  document.getElementById('em-location').value = exp ? (exp.location || '') : '';
  document.getElementById('em-desc').value = exp ? (exp.description || '') : '';
  document.getElementById('em-skills').value = exp && exp.skills ? exp.skills.join(', ') : '';
  document.getElementById('em-delete').style.display = isNew ? 'none' : 'inline-flex';
  const tabLabel = tab === 'entrepreneurial' ? 'Venture' : tab === 'internship' ? 'Internship' : 'Work';
  document.getElementById('em-title').textContent = `${isNew ? 'Add' : 'Edit'} ${tabLabel}`;
  expModal.style.display = '';
  document.getElementById('em-role').focus();
}

document.getElementById('em-save').addEventListener('click', () => {
  const index = parseInt(document.getElementById('em-index').value);
  const tab = document.getElementById('em-tab').value;
  const exp = {
    role: document.getElementById('em-role').value.trim(),
    org: document.getElementById('em-org').value.trim(),
    duration: document.getElementById('em-duration').value.trim(),
    location: document.getElementById('em-location').value.trim(),
    description: document.getElementById('em-desc').value.trim(),
    skills: document.getElementById('em-skills').value.split(',').map(s => s.trim()).filter(Boolean)
  };
  if (!exp.role) { showToast('Role is required!', 'error'); return; }
  if (!STATE.experience[tab]) STATE.experience[tab] = [];
  if (index === -1) STATE.experience[tab].push(exp);
  else STATE.experience[tab][index] = exp;
  saveState();
  closeModal(expModal);
  renderExperience(tab);
  observeReveal();
});

document.getElementById('em-delete').addEventListener('click', () => {
  const index = parseInt(document.getElementById('em-index').value);
  const tab = document.getElementById('em-tab').value;
  if (index < 0) return;
  if (confirm('Delete this experience?')) {
    STATE.experience[tab].splice(index, 1);
    saveState();
    closeModal(expModal);
    renderExperience(tab);
  }
});


/* ============================================================
   MODAL HELPERS
   ============================================================ */
function closeModal(modal) {
  modal.style.display = 'none';
}

// Close modals on overlay click
[projectModal, writingModal, expModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [projectModal, writingModal, expModal].forEach(closeModal);
    document.body.classList.remove('nav-mobile-open');
  }
});


/* ============================================================
   COPY TO CLIPBOARD
   ============================================================ */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = '✓';
      btn.classList.add('copied');
      showToast(`Copied: ${text}`, 'success');
      setTimeout(() => { btn.textContent = '⧉'; btn.classList.remove('copied'); }, 2000);
    } catch (e) {
      showToast('Could not copy.', 'error');
    }
  });
});


/* ============================================================
   CONTACT FORM
   ============================================================ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const message = document.getElementById('form-message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  // Mailto fallback — builds a mailto link and opens it
  const subject = encodeURIComponent(document.getElementById('form-subject').value.trim() || 'Portfolio Contact');
  const body = encodeURIComponent(`Hi Saran,\n\nMy name is ${name}.\n\n${message}\n\nReply to: ${email}`);
  const mailtoLink = `mailto:saranr7367@gmail.com?subject=${subject}&body=${body}`;

  const submitBtn = document.getElementById('form-submit');
  submitBtn.querySelector('.btn-text').style.display = 'none';
  submitBtn.querySelector('.btn-loader').style.display = 'inline';
  submitBtn.disabled = true;

  setTimeout(() => {
    window.open(mailtoLink, '_blank');
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loader').style.display = 'none';
    submitBtn.disabled = false;
    formSuccess.style.display = 'flex';
    contactForm.reset();
    showToast('Opening email client! 📧', 'success');
    setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
  }, 800);
});


/* ============================================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.body.classList.remove('nav-mobile-open');
    }
  });
});


/* ============================================================
   HERO PARALLAX (Subtle)
   ============================================================ */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && scrollY < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
    heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
  }
}, { passive: true });


/* ============================================================
   SECTION HEADER REVEAL
   ============================================================ */
function initSectionReveals() {
  document.querySelectorAll('.section-header').forEach(header => {
    header.classList.add('reveal');
  });
  document.querySelectorAll('.contact-card').forEach(card => {
    card.classList.add('reveal');
  });
  document.querySelectorAll('.contact-form').forEach(f => {
    f.classList.add('reveal');
  });
}


/* ============================================================
   INITIALIZATION
   ============================================================ */
function splitTextIntoChars(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    if (element.dataset.split === 'done') return;
    const text = element.textContent;
    element.textContent = '';
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--char-index', index);
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
    });
    element.classList.add('split-text');
    element.dataset.split = 'done';
  });
}

function initAdCarousel() {
  const slides = document.querySelectorAll('.ad-slide');
  if (!slides.length) return;

  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3200);
}

function init() {
  renderProjects();
  renderWritings();
  renderExperience();
  loadInlineTexts();
  initSectionReveals();
  splitTextIntoChars('.hero-name, .hero-tagline, .hero-badge');
  setTimeout(observeReveal, 200);

  const heroEls = document.querySelectorAll('.hero-badge, .hero-name, .hero-tagline, .hero-tags');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 150 + i * 110);
  });

  const photoWrapper = document.querySelector('.photo-wrapper');
  if (photoWrapper) {
    photoWrapper.style.opacity = '0';
    photoWrapper.style.transform = 'scale(0.96)';
    setTimeout(() => {
      photoWrapper.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      photoWrapper.style.opacity = '1';
      photoWrapper.style.transform = 'scale(1)';
    }, 350);
  }

  initAdCarousel();
}


/* ============================================================
   ADMIN PANEL
   ============================================================ */
function initAdminPanel() {
  const triggerBtn   = document.getElementById('toggle-admin-panel');
  const panel        = document.getElementById('admin-panel');
  const overlay      = document.getElementById('admin-overlay');
  const closeBtn     = document.getElementById('admin-panel-close');
  const editToggle   = document.getElementById('admin-edit-toggle');

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('visible');
    triggerBtn.classList.add('panel-open');
    document.body.classList.add('admin-panel-open');
    document.body.style.overflow = 'hidden';
    // Populate stat inputs with current values
    const sp = document.getElementById('stat-projects');
    const spb = document.getElementById('stat-pubs');
    const se = document.getElementById('stat-exp');
    if (sp) document.getElementById('ap-stat-projects').value = sp.textContent;
    if (spb) document.getElementById('ap-stat-pubs').value = spb.textContent;
    if (se) document.getElementById('ap-stat-exp').value = se.textContent;
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('visible');
    triggerBtn.classList.remove('panel-open');
    document.body.classList.remove('admin-panel-open');
    document.body.style.overflow = '';
  }

  triggerBtn.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      // Gate behind login — if already authenticated this session, open directly
      if (window.isAdminAuthenticated && window.isAdminAuthenticated()) {
        openPanel();
      } else {
        window.showAdminLogin && window.showAdminLogin();
      }
    }
  });

  // Expose openPanel so login success can call it
  window.openAdminPanel = openPanel;

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  // Edit mode toggle (checkbox inside admin panel)
  editToggle.addEventListener('change', () => {
    if (editToggle.checked) enterEditMode();
    else exitEditMode();
  });

  // Save / exit edit from banner
  saveBtn.addEventListener('click', () => { collectInlineEdits(); saveState(); });
  exitBtn.addEventListener('click', () => { collectInlineEdits(); exitEditMode(); });

  // Content Management Buttons
  document.getElementById('ap-add-project').addEventListener('click', () => {
    closePanel(); openProjectModal(-1);
  });
  document.getElementById('ap-add-writing').addEventListener('click', () => {
    closePanel(); openWritingModal(-1);
  });
  document.getElementById('ap-add-internship').addEventListener('click', () => {
    closePanel(); openExpModal('internship', -1);
  });
  document.getElementById('ap-add-work').addEventListener('click', () => {
    closePanel(); openExpModal('work', -1);
  });
  document.getElementById('ap-add-venture').addEventListener('click', () => {
    closePanel(); openExpModal('entrepreneurial', -1);
  });
  document.getElementById('ap-add-tag').addEventListener('click', () => {
    const input = prompt('Enter new tag (with emoji if desired):');
    if (!input || !input.trim()) return;
    const tagsContainer = document.getElementById('hero-tags-container');
    const addTagBtnEl = document.getElementById('add-tag-btn');
    const newTag = document.createElement('span');
    newTag.className = 'hero-tag';
    newTag.setAttribute('data-editable', 'true');
    newTag.setAttribute('contenteditable', isEditMode ? 'true' : 'false');
    newTag.textContent = input.trim();
    tagsContainer.insertBefore(newTag, addTagBtnEl);
    saveHeroTags();
    showToast(`Tag "${input.trim()}" added!`, 'success');
  });

  // Photo
  document.getElementById('ap-change-photo').addEventListener('click', () => {
    closePanel();
    document.getElementById('photo-upload').click();
  });

  // Update stats
  document.getElementById('ap-save-stats').addEventListener('click', () => {
    const spEl = document.getElementById('stat-projects');
    const spbEl = document.getElementById('stat-pubs');
    const seEl = document.getElementById('stat-exp');
    const v1 = document.getElementById('ap-stat-projects').value.trim();
    const v2 = document.getElementById('ap-stat-pubs').value.trim();
    const v3 = document.getElementById('ap-stat-exp').value.trim();
    if (spEl && v1) { spEl.textContent = v1; localStorage.setItem('portfolio_text_stat-projects', v1); }
    if (spbEl && v2) { spbEl.textContent = v2; localStorage.setItem('portfolio_text_stat-pubs', v2); }
    if (seEl && v3) { seEl.textContent = v3; localStorage.setItem('portfolio_text_stat-exp', v3); }
    showToast('Stats updated! 📊', 'success');
  });

  // Save all
  document.getElementById('ap-save-all').addEventListener('click', () => {
    collectInlineEdits();
    saveState();
  });

  // Reset to defaults
  document.getElementById('ap-reset-data').addEventListener('click', () => {
    if (!confirm('Reset ALL content to default sample data? This cannot be undone.')) return;
    localStorage.removeItem('portfolio_data_v2');
    localStorage.removeItem('portfolio_photo');
    localStorage.removeItem('portfolio_hero_tags');
    ['stat-projects','stat-pubs','stat-exp','hero-badge','name-first','name-last',
     'hero-tagline','projects-title','writings-title','experience-title','contact-title',
     'footer-copy'].forEach(k => localStorage.removeItem(`portfolio_text_${k}`));
    showToast('Reset to defaults — reloading...', 'success');
    setTimeout(() => location.reload(), 1200);
  });

  // Export JSON
  document.getElementById('ap-export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'portfolio_data.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported! ⬇️', 'success');
  });

  // Theme buttons inside admin panel
  document.getElementById('ap-theme-dark').addEventListener('click', () => {
    setTheme('dark');
    document.getElementById('ap-theme-dark').classList.add('active');
    document.getElementById('ap-theme-light').classList.remove('active');
  });
  document.getElementById('ap-theme-light').addEventListener('click', () => {
    setTheme('light');
    document.getElementById('ap-theme-light').classList.add('active');
    document.getElementById('ap-theme-dark').classList.remove('active');
  });
}


/* ============================================================
   DARK / LIGHT MODE THEME TOGGLE
   ============================================================ */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const iconDark = themeBtn.querySelector('.theme-icon-dark');
  const iconLight = themeBtn.querySelector('.theme-icon-light');

  function applyTheme(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      iconDark.style.display = 'none';
      iconLight.style.display = 'inline';
      document.getElementById('ap-theme-light').classList.add('active');
      document.getElementById('ap-theme-dark').classList.remove('active');
    } else {
      document.body.classList.remove('light-mode');
      iconLight.style.display = 'none';
      iconDark.style.display = 'inline';
      document.getElementById('ap-theme-dark').classList.add('active');
      document.getElementById('ap-theme-light').classList.remove('active');
    }
    try { localStorage.setItem('portfolio_theme', mode); } catch(e) {}
  }

  window.setTheme = applyTheme;

  themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    applyTheme(isLight ? 'dark' : 'light');
    showToast(isLight ? '🌙 Switched to Dark Mode' : '☀️ Switched to Light Mode', 'success');
  });

  // Load saved theme
  try {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved) applyTheme(saved);
  } catch(e) {}
}


/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  init();
  initAdminLogin();   // ← must run before initAdminPanel
  initAdminPanel();
  initThemeToggle();
});

