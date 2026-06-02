(() => {
  if (window.location.protocol === 'http:' && !/^(localhost|127\\.0\\.0\\.1)$/i.test(window.location.hostname)) {
    window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
    return;
  }
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SITE_SETTINGS_KEY = 'bv_site_settings_v1';
  const CUSTOM_EXPLORE_KEY = 'bv_custom_explore_tiles_v1';
  const CUSTOM_POSTS_KEY = 'bv_custom_blog_posts_v1';
  const CUSTOM_TEAM_KEY = 'bv_custom_team_members_v1';
  const defaultSiteSettings = {
    heroTitle: 'The Rising Bihar, The Growing Bihar',
    heroSubtitle: 'Discover landmarks, festivals, cuisine, stories, and trusted local businesses - curated for tourists, locals, students, and partners.',
    ctaPrimary: 'Explore Bihar',
    ctaSecondary: 'List Your Business',
    searchPlaceholder: 'Search places, businesses, events, guides...',
    exploreTitle: 'Top Favorite Destinations in Bihar',
    exploreSubtitle: 'Handpicked places across Bihar for heritage lovers, cultural explorers, and first-time travelers.',
    catAll: 'All',
    catLandmarks: 'Landmarks',
    catFestivals: 'Festivals',
    catCuisine: 'Cuisine',
    catCulture: 'Culture',
    catSpiritual: 'Spiritual',
    catWildlife: 'Wildlife',
    blogTitle: 'Blog',
    blogSubtitle: 'Articles by category, featured stories, and latest Bihar updates.',
    mediaTitle: 'Media Integration',
    mediaSubtitle: 'YouTube embedding, Instagram reel-style showcase, and muted autoplay support.',
    mediaYoutubeUrl: 'https://www.youtube.com/watch?v=vUbjMRUI_Cs',
    mediaYoutubeTitle: 'The Rising Bihar, The Growing Bihar',
    mediaInsta1: 'https://www.instagram.com/p/DVBY0SNiVoR/',
    mediaInsta2: 'https://www.instagram.com/p/DU_BG4MCeoy/',
    mediaInsta3: 'https://www.instagram.com/p/DU8L3PZCd8T/',
    supportEmail: 'hello@biharvihaan.com',
    supportPhone: '+91 94300 41925',
    officeLocation: 'Patna, Bihar',
    showServices: true,
    showBlog: true,
    showMedia: true
  };
  const getAdminSiteSettings = () => {
    try {
      const raw = window.localStorage.getItem(SITE_SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const merged = { ...defaultSiteSettings, ...(parsed || {}) };
      if (!parsed?.ctaSecondary || parsed.ctaSecondary === 'Discover Services') {
        merged.ctaSecondary = defaultSiteSettings.ctaSecondary;
      }
      if (
        !parsed?.exploreTitle ||
        parsed.exploreTitle === 'Explore Bihar' ||
        parsed.exploreTitle === 'Featured Destinations'
      ) {
        merged.exploreTitle = defaultSiteSettings.exploreTitle;
      }
      if (
        !parsed?.exploreSubtitle ||
        parsed.exploreSubtitle === 'Tourist places, cultural heritage, festivals, and art traditions of Bihar in one curated space.'
      ) {
        merged.exploreSubtitle = defaultSiteSettings.exploreSubtitle;
      }
      return merged;
    } catch (_) {
      return { ...defaultSiteSettings };
    }
  };
  const readStoredArray = (key) => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };
  let siteSettings = getAdminSiteSettings();
  const setTextIf = (selector, text) => {
    const node = $(selector);
    if (node && typeof text === 'string' && text) node.textContent = text;
  };
  const setDisplayIf = (selector, show) => {
    $$(selector).forEach((node) => {
      node.style.display = show ? '' : 'none';
    });
  };
  const sanitizeUrl = (input, { allowRelative = false } = {}) => {
    const raw = String(input || '').trim();
    if (!raw) return '';
    if (allowRelative && (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../') || raw.startsWith('#'))) {
      return raw;
    }
    try {
      const url = new URL(raw, window.location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      return allowRelative && url.origin === window.location.origin
        ? `${url.pathname}${url.search}${url.hash}`
        : url.toString();
    } catch (_) {
      return '';
    }
  };
  const sanitizeMediaUrl = (input) => sanitizeUrl(input, { allowRelative: true });
  const sanitizeLinkHref = (input) => sanitizeUrl(input, { allowRelative: true }) || '#';
  const escapeHtml = (value) =>
    String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  const DEFAULT_YOUTUBE_VIDEO_ID = 'vUbjMRUI_Cs';
  const buildYouTubeEmbedUrl = (videoId) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&mute=1&playsinline=1`;
  const isYouTubeId = (value) => /^[A-Za-z0-9_-]{11}$/.test(String(value || '').trim());
  const extractYouTubeId = (url) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (isYouTubeId(raw)) return raw;
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();
      const seg = u.pathname.split('/').filter(Boolean);
      if (host === 'youtu.be' && isYouTubeId(seg[0])) return seg[0];
      if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
        const v = u.searchParams.get('v');
        if (isYouTubeId(v)) return v;
        if ((seg[0] === 'embed' || seg[0] === 'shorts' || seg[0] === 'live') && isYouTubeId(seg[1])) {
          return seg[1];
        }
      }
    } catch (_) {
      // Ignore parse errors and try regex fallback below.
    }
    const m = raw.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    return m?.[1] || '';
  };
  const toYouTubeEmbed = (url) => {
    const id = extractYouTubeId(url) || DEFAULT_YOUTUBE_VIDEO_ID;
    return buildYouTubeEmbedUrl(id);
  };
  const toInstagramEmbed = (url) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
      const u = new URL(raw);
      const parts = u.pathname.split('/').filter(Boolean);
      const type = (parts[0] || '').toLowerCase();
      const code = parts[1] || '';
      if ((type === 'p' || type === 'reel' || type === 'tv') && code) {
        return `https://www.instagram.com/${type}/${code}/embed?autoplay=1&muted=1`;
      }
    } catch (_) {
      // Ignore parse errors and try regex fallback below.
    }
    const m = raw.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
    if (!m) return '';
    return `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/embed?autoplay=1&muted=1`;
  };
  const renderCustomExploreTiles = () => {
    const gallery = $('[data-gallery-grid]');
    if (!gallery) return;
    $$('[data-generated="custom"]', gallery).forEach((el) => el.remove());
    const custom = readStoredArray(CUSTOM_EXPLORE_KEY);
    const labelMap = {
      landmarks: 'Landmark',
      festivals: 'Festival',
      cuisine: 'Cuisine',
      culture: 'Culture'
    };
    custom.forEach((item) => {
      const category = String(item.category || 'culture').toLowerCase();
      const title = String(item.title || 'Explore').trim();
      const image = sanitizeMediaUrl(item.image);
      if (!title || !image) return;
      const card = document.createElement('article');
      card.className = 'tile';
      card.dataset.category = category;
      card.dataset.title = title;
      card.dataset.generated = 'custom';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Open ${title} spotlight`);
      const img = document.createElement('img');
      img.alt = title;
      img.src = image;
      img.loading = 'lazy';
      img.decoding = 'async';
      const meta = document.createElement('div');
      meta.className = 'tile__meta';
      const h3 = document.createElement('h3');
      h3.className = 'tile__title';
      h3.textContent = title;
      const p = document.createElement('p');
      p.className = 'tile__sub';
      p.textContent = labelMap[category] || 'Culture';
      meta.append(h3, p);
      card.append(img, meta);
      gallery.appendChild(card);
    });
  };
  const renderTeamMembers = () => {
    const teamWrap = $('.about__team .team');
    if (!teamWrap) return;
    const custom = readStoredArray(CUSTOM_TEAM_KEY).filter((x) => x && x.name && x.role && x.image);
    if (!custom.length) return;
    teamWrap.innerHTML = '';
    custom.forEach((member) => {
      const imgUrl = sanitizeMediaUrl(member.image);
      if (!imgUrl) return;
      const person = document.createElement('div');
      person.className = 'person';
      const img = document.createElement('img');
      img.alt = 'Team member';
      img.src = imgUrl;
      img.loading = 'lazy';
      img.decoding = 'async';
      const name = document.createElement('div');
      name.className = 'person__name';
      name.textContent = String(member.name || '').trim();
      const role = document.createElement('div');
      role.className = 'person__role';
      role.textContent = String(member.role || '').trim();
      person.append(img, name, role);
      teamWrap.appendChild(person);
    });
  };
  const applyAdminSiteSettings = (currentLang = 'en') => {
    renderCustomExploreTiles();
    renderTeamMembers();
    if (currentLang === 'en') {
      setTextIf('.hero__title', siteSettings.heroTitle);
      setTextIf('.hero__subtitle', siteSettings.heroSubtitle);
      setTextIf('.hero__cta .btn--primary', siteSettings.ctaPrimary);
      setTextIf('.hero__cta .btn--soft', siteSettings.ctaSecondary);
      const globalSearchInput = $('#globalSearch');
      if (globalSearchInput && siteSettings.searchPlaceholder) {
        globalSearchInput.setAttribute('placeholder', siteSettings.searchPlaceholder);
      }
      setTextIf('#portfolio .section-head .h2', siteSettings.exploreTitle);
      setTextIf('#portfolio .section-head .muted', siteSettings.exploreSubtitle);
      setTextIf('.chip[data-filter="all"]', siteSettings.catAll);
      setTextIf('.chip[data-filter="landmarks"]', siteSettings.catLandmarks);
      setTextIf('.chip[data-filter="festivals"]', siteSettings.catFestivals);
      setTextIf('.chip[data-filter="cuisine"]', siteSettings.catCuisine);
      setTextIf('.chip[data-filter="culture"]', siteSettings.catCulture);
      setTextIf('.chip[data-filter="spiritual"]', siteSettings.catSpiritual);
      setTextIf('.chip[data-filter="wildlife"]', siteSettings.catWildlife);
      setTextIf('#blog .section-head .h2', siteSettings.blogTitle);
      setTextIf('#blog .section-head .muted', siteSettings.blogSubtitle);
      setTextIf('#media .section-head .h2', siteSettings.mediaTitle);
      setTextIf('#media .section-head .muted', siteSettings.mediaSubtitle);

    }
    const mediaFrame = $('#media .embed iframe');
    if (mediaFrame) {
      const embedUrl = toYouTubeEmbed(siteSettings.mediaYoutubeUrl || defaultSiteSettings.mediaYoutubeUrl);
      mediaFrame.setAttribute('src', embedUrl);
    }
    setTextIf('[data-youtube-title]', siteSettings.mediaYoutubeTitle || defaultSiteSettings.mediaYoutubeTitle);
    const instaCards = $$('#media .insta-reel');
    const instaUrls = [siteSettings.mediaInsta1, siteSettings.mediaInsta2, siteSettings.mediaInsta3];
    instaCards.forEach((card, idx) => {
      const url = instaUrls[idx];
      const embedUrl = toInstagramEmbed(url);
      if (embedUrl) card.setAttribute('src', embedUrl);
    });

    const phone = siteSettings.supportPhone || defaultSiteSettings.supportPhone;
    const email = siteSettings.supportEmail || defaultSiteSettings.supportEmail;
    const location = siteSettings.officeLocation || defaultSiteSettings.officeLocation;
    setTextIf('.info__row:nth-of-type(1) .info__v', phone);
    $$('.info__row:nth-of-type(2) .info__v a').forEach((a) => {
      a.setAttribute('href', `mailto:${email}`);
      if (a.textContent.trim().toLowerCase() === 'send an email') return;
      a.textContent = email;
    });
    setTextIf('.info__row:nth-of-type(3) .info__v', location);

    const footerContactLine = $$('.footer__desc').find((p) => p.textContent.trim().startsWith('Contact:'));
    if (footerContactLine) {
      footerContactLine.textContent = `Contact: ${phone} · ${email} · ${location}`;
    }

    setDisplayIf('#services, .nav__link[href="#services"], .footer__link[href="#services"]', siteSettings.showServices);
    setDisplayIf('#blog, .nav__link[href="#blog"], .nav__link[href="blog.html"], .footer__link[href="#blog"], .footer__link[href="blog.html"]', siteSettings.showBlog);
    setDisplayIf('#media, .nav__link[href="media-gallery.html"], .footer__link[href="media-gallery.html"]', siteSettings.showMedia);
  };

  // Year
  const year = new Date().getFullYear();
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(year);

  // Sticky header elevate
  const header = document.querySelector('.site-header');
  const setHeader = () => {
    if (!header) return;
    header.classList.toggle('is-elevated', window.scrollY > 6);
  };
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  // Mobile nav
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const setNavOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      setNavOpen(open);
    });
  }
  $$('.nav__link').forEach((a) => {
    a.addEventListener('click', () => setNavOpen(false));
  });

  // Active link highlighting
  const sections = $$('main section[id]');
  const links = $$('.nav__link');
  const sectionLinks = links.filter((l) => (l.getAttribute('href') || '').startsWith('#'));
  const byId = new Map(sectionLinks.map((l) => [l.getAttribute('href')?.slice(1), l]));
  if (sections.length && sectionLinks.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        sectionLinks.forEach((l) => l.classList.remove('is-active'));
        const id = visible.target.id;
        const link = byId.get(id);
        if (link) link.classList.add('is-active');
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65] }
    );
    sections.forEach((s) => io.observe(s));
  }

  // To top
  const toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Modals
  const closeDialog = (dialog) => {
    if (!dialog) return;
    try {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    } catch (_) {
      dialog.removeAttribute('open');
    }
  };
  const openModal = (name) => {
    const d = document.querySelector(`[data-modal="${name}"]`);
    if (!d) return;
    try {
      if (typeof d.showModal === 'function') {
        d.showModal();
      } else {
        d.setAttribute('open', '');
      }
    } catch (_) {
      d.setAttribute('open', '');
    }
  };
  const bindOpen = (selector, name) => {
    $$(selector).forEach((btn) => btn.addEventListener('click', () => openModal(name)));
  };
  bindOpen('[data-open-login]', 'login');
  bindOpen('[data-open-signup]', 'signup');
  bindOpen('[data-open-admin]', 'admin-login');

  // Admin login: route to server-side protected admin login page
  const adminLoginDialog = document.querySelector('[data-modal="admin-login"]');
  const adminLoginPrimary = document.querySelector('[data-modal="admin-login"] .modal__actions .btn--primary');
  if (adminLoginDialog && adminLoginPrimary) {
    adminLoginPrimary.addEventListener('click', (e) => {
      e.preventDefault();
      const username = String($('#adminUser')?.value || '').trim();
      const password = String($('#adminPass')?.value || '').trim();
      if (!username || !password) return;
      closeDialog(adminLoginDialog);
      window.location.href = 'admin-login.php';
    });
  }
  const loginDialog = document.querySelector('[data-modal="login"]');
  const loginPrimary = document.querySelector('[data-modal="login"] .modal__actions .btn--primary');
  if (loginDialog && loginPrimary) {
    loginPrimary.addEventListener('click', (e) => {
      e.preventDefault();
      const email = String($('#loginEmail')?.value || '').trim();
      const pass = String($('#loginPass')?.value || '').trim();
      if (!email || !pass) return;
      closeDialog(loginDialog);
      alert('Login captured (UI mode). Connect Firebase auth for production.');
    });
  }
  const signupDialog = document.querySelector('[data-modal="signup"]');
  const signupPrimary = document.querySelector('[data-modal="signup"] .modal__actions .btn--primary');
  if (signupDialog && signupPrimary) {
    signupPrimary.addEventListener('click', (e) => {
      e.preventDefault();
      const name = String($('#signupName')?.value || '').trim();
      const email = String($('#signupEmail')?.value || '').trim();
      const pass = String($('#signupPass')?.value || '').trim();
      const pass2 = String($('#signupPass2')?.value || '').trim();
      if (!name || !email || !pass || !pass2 || pass !== pass2) return;
      closeDialog(signupDialog);
      alert('Sign up captured (UI mode). Connect Firebase auth for production.');
    });
  }

  // Switch between auth modals
  document.addEventListener('click', (e) => {
    const switchBtn = e.target.closest('[data-switch-modal]');
    if (!switchBtn) return;
    const target = switchBtn.getAttribute('data-switch-modal');
    if (!target) return;
    const parentDialog = switchBtn.closest('dialog.modal');
    if (parentDialog) closeDialog(parentDialog);
    openModal(target);
  });

  // Modal close handlers (explicit close for all modals)
  $$('dialog.modal').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      // Close if: close icon (✕), Cancel, Close, or clicking outside
      if (
        btn.value === 'cancel' ||
        btn.getAttribute('value') === 'cancel' ||
        btn.getAttribute('aria-label') === 'Close'
      ) {
        closeDialog(dialog);
      }
    });
    // Click backdrop to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog(dialog);
    });
  });

  // Contact form (UI only)
  const contactForm = document.querySelector('[data-contact-form]');
  const statusEl = document.querySelector('[data-form-status]');
  if (contactForm && statusEl) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      statusEl.textContent = 'Thanks! Your message has been recorded (demo UI).';
      contactForm.reset();
      window.setTimeout(() => (statusEl.textContent = ''), 4500);
    });
  }
  const contactPageForm = $('[data-contact-page-form]');
  const contactPageStatus = $('[data-contact-page-status]');
  if (contactPageForm && contactPageStatus) {
    contactPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactPageForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();
      if (name.length < 2 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || message.length < 10) {
        contactPageStatus.textContent = 'Please enter valid name, email, and a detailed message.';
        return;
      }
      contactPageStatus.textContent = 'Thanks! Your message has been captured successfully.';
      contactPageForm.reset();
      window.setTimeout(() => {
        contactPageStatus.textContent = '';
      }, 4000);
    });
  }
  const newsletterForm = $('.newsletter__form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = String(new FormData(newsletterForm).get('email') || '').trim();
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return;
      alert('Subscription captured (UI mode). Connect this form to Firebase/Email API for production.');
      newsletterForm.reset();
    });
  }
  const testimonialForm = $('[data-testimonial-form]');
  const testimonialStatus = $('[data-testimonial-status]');
  const testimonialsGrid = $('.testimonials-grid');
  if (testimonialForm && testimonialStatus && testimonialsGrid) {
    testimonialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(testimonialForm);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const role = String(fd.get('role') || '').trim();
      const city = String(fd.get('city') || '').trim();
      const quoteRaw = String(fd.get('quote') || '').trim();

      if (!name || !email || !role || !city || !quoteRaw) {
        testimonialStatus.textContent = 'Please fill name, email, role, city, and feedback before submitting.';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        testimonialStatus.textContent = 'Please enter a valid email address.';
        return;
      }

      const quote = quoteRaw.startsWith('"') ? quoteRaw : `"${quoteRaw}"`;
      const card = document.createElement('article');
      card.className = 'card testimonial-card';

      const headNode = document.createElement('div');
      headNode.className = 'testimonial-card__head';

      const avatarNode = document.createElement('img');
      avatarNode.className = 'testimonial-card__avatar';
      avatarNode.alt = name;
      avatarNode.loading = 'lazy';
      avatarNode.decoding = 'async';
      avatarNode.referrerPolicy = 'no-referrer';
      const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=b63b33&color=fff&size=128`;
      avatarNode.src = `https://unavatar.io/${encodeURIComponent(email)}`;
      avatarNode.onerror = () => {
        avatarNode.onerror = null;
        avatarNode.src = fallbackPhoto;
      };

      const metaNode = document.createElement('div');

      const quoteNode = document.createElement('p');
      quoteNode.className = 'testimonial-card__quote';
      quoteNode.textContent = quote;

      const nameNode = document.createElement('p');
      nameNode.className = 'testimonial-card__name';
      nameNode.textContent = name;

      const roleNode = document.createElement('p');
      roleNode.className = 'testimonial-card__role';
      roleNode.textContent = role;

      const cityNode = document.createElement('p');
      cityNode.className = 'testimonial-card__city';
      cityNode.textContent = city;

      const emailNode = document.createElement('p');
      emailNode.className = 'testimonial-card__email';

      const emailLink = document.createElement('a');
      emailLink.href = `mailto:${email}`;
      emailLink.textContent = email;
      emailNode.appendChild(emailLink);

      metaNode.append(nameNode, roleNode, cityNode, emailNode);
      headNode.append(avatarNode, metaNode);
      card.append(headNode, quoteNode);
      testimonialsGrid.prepend(card);
      testimonialForm.reset();
      testimonialStatus.textContent = 'Thanks! Your feedback has been added.';
      window.setTimeout(() => {
        testimonialStatus.textContent = '';
      }, 3500);
    });
  }
  $('[data-enable-notifications]')?.addEventListener('click', async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Bihar Vihaan', { body: 'Notifications enabled for travel updates and new posts.' });
    }
  });
  const trackAdClick = (slot) => {
    try {
      const key = `bv_ad_click_${slot.getAttribute('data-ad-slot') || 'unknown'}`;
      const prev = Number(window.localStorage.getItem(key) || '0');
      window.localStorage.setItem(key, String(prev + 1));
    } catch (_) {
      // Ignore storage restrictions.
    }
  };
  const openAdTarget = (slot) => {
    const rawTarget = String(slot.getAttribute('data-ad-target') || '').trim();
    if (!rawTarget) return;
    const target = sanitizeLinkHref(rawTarget);
    if (!target || target === '#') return;
    if (target.startsWith('#')) {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.open(target, '_blank', 'noopener');
  };
  const bindAdSlots = (root = document) => {
    $$('[data-ad-slot]', root).forEach((slot) => {
      if (slot.dataset.adBound === '1') return;
      slot.dataset.adBound = '1';
      slot.addEventListener('click', (e) => {
        const isAnchorClick = Boolean(e.target?.closest?.('a[href]'));
        trackAdClick(slot);
        if (isAnchorClick) return;
        openAdTarget(slot);
      });
      slot.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        trackAdClick(slot);
        openAdTarget(slot);
      });
    });
  };
  bindAdSlots();

  // Global search (routes to matching section)
  const globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch) {
    globalSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = String(new FormData(globalSearch).get('q') || '').trim().toLowerCase();
      if (!q) return;
      const targets = [
        { keys: ['service', 'services', 'digital', 'branding', 'advertising'], id: 'services' },
        { keys: ['hotel', 'tour', 'business', 'directory', 'partner'], id: 'services' },
        { keys: ['festival', 'event', 'calendar', 'register'], id: 'services' },
        { keys: ['media', 'youtube', 'instagram', 'reel'], id: 'media' },
        { keys: ['sponsored', 'ad', 'ads', 'banner'], id: 'business-spotlight' },
        { keys: ['marketplace', 'shop', 'vendor', 'payment', 'razorpay', 'upi'], id: 'business-directory' },
        { keys: ['blog', 'news', 'post', 'story'], id: 'blog' },
        { keys: ['gallery', 'photo', 'landmark', 'cuisine', 'culture'], id: 'portfolio' },
        { keys: ['contact', 'email', 'phone'], id: 'contact' },
      ];
      const hit = targets.find((t) => t.keys.some((k) => q.includes(k)));
      const targetId = hit?.id || 'portfolio';
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (targetId === 'blog') {
        window.location.href = 'blog.html';
        return;
      }
      if (targetId === 'media') {
        window.location.href = 'media-gallery.html';
        return;
      }
      window.location.href = `index.html#${targetId}`;
    });
  }

  // Gallery filter + search
  const galleryGrid = document.querySelector('[data-gallery-grid]');
  const gallerySearch = document.querySelector('[data-gallery-search]');
  const chips = $$('.chip[data-filter]');
  let activeCat = 'all';

  const applyGallery = () => {
    if (!galleryGrid) return;
    const q = (gallerySearch?.value || '').trim().toLowerCase();
    $$('[data-category]', galleryGrid).forEach((tile) => {
      const cat = tile.getAttribute('data-category') || '';
      const title = (tile.getAttribute('data-title') || '').toLowerCase();
      const okCat = activeCat === 'all' || cat === activeCat;
      const okQ = !q || title.includes(q);
      tile.style.display = okCat && okQ ? '' : 'none';
    });
  };

  chips.forEach((c) =>
    c.addEventListener('click', () => {
      chips.forEach((x) => {
        x.classList.remove('is-active');
        x.setAttribute('aria-selected', 'false');
      });
      c.classList.add('is-active');
      c.setAttribute('aria-selected', 'true');
      activeCat = c.getAttribute('data-filter') || 'all';
      applyGallery();
    })
  );
  gallerySearch?.addEventListener('input', applyGallery);

  // Local business directory filter + search
  const dirFilterChips = $$('[data-dir-filter]');
  const dirSearch = $('[data-directory-search]');
  let activeDirCategory = 'all';
  const applyDirectory = () => {
    const q = (dirSearch?.value || '').trim().toLowerCase();
    $$('[data-dir-category]').forEach((card) => {
      const cat = (card.getAttribute('data-dir-category') || '').toLowerCase();
      const title = (card.getAttribute('data-dir-title') || '').toLowerCase();
      const okCat = activeDirCategory === 'all' || cat === activeDirCategory;
      const okQ = !q || title.includes(q);
      card.style.display = okCat && okQ ? '' : 'none';
    });
  };
  dirFilterChips.forEach((chip) =>
    chip.addEventListener('click', () => {
      dirFilterChips.forEach((x) => {
        x.classList.remove('is-active');
        x.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      activeDirCategory = (chip.getAttribute('data-dir-filter') || 'all').toLowerCase();
      applyDirectory();
    })
  );
  dirSearch?.addEventListener('input', applyDirectory);

  // Spotlight modal from tiles
  const spotlightTitle = document.querySelector('[data-spotlight-title]');
  const spotlightImg = document.querySelector('[data-spotlight-img]');
  const spotlightCat = document.querySelector('[data-spotlight-cat]');
  const spotlightDesc = document.querySelector('[data-spotlight-desc]');

  const openSpotlightFromTile = (tile) => {
    const title = tile.getAttribute('data-title') || 'Spotlight';
    const cat = tile.getAttribute('data-category') || '';
    const img = tile.querySelector('img')?.getAttribute('src') || '';
    const catLabels = lang !== 'en'
      ? { landmarks: 'स्थल', festivals: 'त्योहार', cuisine: 'खानपान', culture: 'संस्कृति' }
      : { landmarks: 'Landmarks', festivals: 'Festivals', cuisine: 'Cuisine', culture: 'Culture' };
    if (spotlightTitle) spotlightTitle.textContent = title;
    if (spotlightImg) spotlightImg.src = img;
    if (spotlightCat) spotlightCat.textContent = catLabels[cat] || cat;
    if (spotlightDesc) {
      spotlightDesc.textContent = lang !== 'en'
        ? 'इस आइटम के लिए स्टोरी प्लेसहोल्डर। विस्तृत सामग्री, पार्टनर लिंक और यात्रा योजना जोड़ें।'
        : 'Story placeholder for this item. Add detailed content, partner links, and itineraries.';
    }
    openModal('spotlight');
  };

  galleryGrid?.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile[data-category]');
    if (!tile) return;
    openSpotlightFromTile(tile);
  });
  galleryGrid?.addEventListener('keydown', (e) => {
    const tile = e.target.closest('.tile[data-category]');
    if (!tile) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSpotlightFromTile(tile);
    }
  });

  // Blog data + render + search + category filter
  let lang = 'en';
  const postsByLang = {
    en: [
      {
        title: 'A Weekend in Patna',
        category: 'Tourism',
        tags: ['itinerary', 'food', 'heritage'],
        url: 'blog-weekend-patna.html',
        img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Heritage walk, local food trail, and riverfront experience in one plan.',
        featured: true
      },
      {
        title: 'Madhubani: Art that Speaks',
        category: 'Culture',
        tags: ['art', 'craft', 'heritage'],
        url: 'blog-madhubani-art.html',
        img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1400&q=80',
        excerpt: "Stories, motifs, and artists behind Bihar's iconic art tradition."
      },
      {
        title: 'Local businesses powering tourism',
        category: 'Business',
        tags: ['partners', 'directory', 'growth'],
        url: 'blog-local-business-tourism.html',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'How hotels, guides, artisans, and cafes shape visitor experience and livelihoods.'
      },
      {
        title: 'Chhath Puja: devotion on the ghats',
        category: 'Local News',
        tags: ['festival', 'tradition', 'ganga'],
        url: 'blog-chhath-puja-ghats.html',
        img: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A respectful overview of the rituals, timelines, and viewing etiquette for visitors.'
      },
      {
        title: 'Rajgir beyond the usual',
        category: 'Tourism',
        tags: ['nature', 'history', 'weekend'],
        url: 'blog-rajgir-beyond.html',
        img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Cliffs, hot springs, and history-how to plan a balanced, low-stress day trip.'
      },
      {
        title: 'Cuisine Guide: Litti Special',
        category: 'Food',
        tags: ['cuisine', 'food', 'local'],
        url: 'blog-litti-guide.html',
        img: 'https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Best way to explore authentic local flavors and food.'
      },
      {
        title: 'Patna Riverfront Evening Walk Guide',
        category: 'Tourism',
        tags: ['riverfront', 'walk', 'patna'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Best sunset windows, safe routes, and local snack stops for an easy evening plan.'
      },
      {
        title: 'Mithila Craft Trail: What to Buy and Why',
        category: 'Culture',
        tags: ['mithila', 'craft', 'shopping'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A practical guide to handmade items, authenticity checks, and fair artisan pricing.'
      },
      {
        title: 'Bodh Gaya guide: calm, sacred, and practical',
        category: 'Spiritual',
        tags: ['bodh gaya', 'temple', 'pilgrimage'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A respectful visitor guide to Mahabodhi Temple area, timings, and spiritual etiquette.'
      },
      {
        title: 'Top colleges in Bihar: admissions and opportunities',
        category: 'Education',
        tags: ['college', 'students', 'career'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A student-friendly overview of major colleges, courses, and planning tips for admissions.'
      },
      {
        title: 'Nalanda legacy: why this history still matters',
        category: 'History',
        tags: ['nalanda', 'heritage', 'civilization'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Understand the legacy of ancient Bihar through Nalanda and its enduring global relevance.'
      },
      {
        title: 'Valmiki eco trail: wildlife with local guidance',
        category: 'Tourism',
        tags: ['valmiki', 'wildlife', 'eco tourism'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A practical route for nature lovers with safer timings, guide support, and local stay options.'
      },
      {
        title: 'Patna Sahib spiritual route for first-time visitors',
        category: 'Spiritual',
        tags: ['patna sahib', 'faith', 'pilgrimage'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A respectful walkthrough of key prayer points, travel timing, and old-city movement tips.'
      },
      {
        title: 'Bihar startup stories: local brands going digital',
        category: 'Business',
        tags: ['startup', 'growth', 'digital'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'How emerging Bihar founders are using content, community, and commerce to scale responsibly.'
      },
      {
        title: 'Festival sweets of Bihar: from thekua to khaja',
        category: 'Food',
        tags: ['sweets', 'festival', 'regional'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1505253213348-cd54c92b37be?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A curated flavor guide to festive sweets and where travelers can try authentic local versions.'
      },
      {
        title: 'Student roadmap: scholarships and skill programs in Bihar',
        category: 'Education',
        tags: ['scholarship', 'students', 'skills'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'Actionable options for students looking for affordable education pathways and training support.'
      },
      {
        title: 'Pataliputra to Patna: a timeline of transformation',
        category: 'History',
        tags: ['pataliputra', 'timeline', 'civilization'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'A compact historical timeline showing how ancient political centers evolved into modern Patna.'
      }
    ],
    hi: [
      {
        title: 'पटना में एक वीकेंड',
        category: 'पर्यटन',
        tags: ['यात्रा योजना', 'खानपान', 'विरासत'],
        url: 'blog-weekend-patna.html',
        img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'विरासत यात्रा, लोकल फूड ट्रेल और रिवरफ्रंट अनुभव एक ही प्लान में।',
        featured: true
      },
      {
        title: 'मधुबनी: बोलती हुई कला',
        category: 'संस्कृति',
        tags: ['कला', 'शिल्प', 'विरासत'],
        url: 'blog-madhubani-art.html',
        img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'कहानियां, प्रतीक और कलाकार जो बिहार की इस प्रतिष्ठित कला परंपरा को जीवित रखते हैं।'
      },
      {
        title: 'स्थानीय व्यवसाय जो पर्यटन को बढ़ाते हैं',
        category: 'बिजनेस',
        tags: ['पार्टनर', 'डायरेक्टरी', 'विकास'],
        url: 'blog-local-business-tourism.html',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'होटल, गाइड, कारीगर और कैफे कैसे पर्यटकों के अनुभव और आजीविका को मजबूत करते हैं।'
      },
      {
        title: 'छठ पूजा: घाटों पर आस्था',
        category: 'स्थानीय समाचार',
        tags: ['त्योहार', 'परंपरा', 'गंगा'],
        url: 'blog-chhath-puja-ghats.html',
        img: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'दर्शकों के लिए अनुष्ठान, समय-सारणी और शिष्टाचार का सरल और सम्मानजनक परिचय।'
      },
      {
        title: 'राजगीर: सामान्य से आगे',
        category: 'पर्यटन',
        tags: ['प्रकृति', 'इतिहास', 'वीकेंड'],
        url: 'blog-rajgir-beyond.html',
        img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'पहाड़ियां, गर्म झरने और इतिहास-एक आरामदायक दिन-यात्रा की बेहतर योजना बनाएं।'
      },
      {
        title: 'खानपान गाइड: लिट्टी स्पेशल',
        category: 'खानपान',
        tags: ['खानपान', 'भोजन', 'स्थानीय'],
        url: 'blog-litti-guide.html',
        img: 'https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'लोकल और असली स्वाद के साथ बिहारी खानपान समझने का सबसे आसान तरीका।'
      },
      {
        title: 'पटना रिवरफ्रंट इवनिंग वॉक गाइड',
        category: 'पर्यटन',
        tags: ['रिवरफ्रंट', 'वॉक', 'पटना'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'सुरक्षित रूट, बेहतरीन सनसेट समय और स्थानीय स्नैक स्टॉप की उपयोगी जानकारी।'
      },
      {
        title: 'मिथिला क्राफ्ट ट्रेल: क्या खरीदें और क्यों',
        category: 'संस्कृति',
        tags: ['मिथिला', 'शिल्प', 'खरीदारी'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'हैंडमेड वस्तुओं की पहचान, प्रामाणिकता जांच और सही मूल्य समझने की सरल गाइड।'
      },
      {
        title: 'बोधगया यात्रा गाइड: शांत, पवित्र और उपयोगी',
        category: 'आध्यात्मिक',
        tags: ['बोधगया', 'मंदिर', 'तीर्थ'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'महाबोधि मंदिर क्षेत्र के लिए समय, शिष्टाचार और यात्रा की उपयोगी जानकारी।'
      },
      {
        title: 'बिहार के प्रमुख कॉलेज: एडमिशन और अवसर',
        category: 'शिक्षा',
        tags: ['कॉलेज', 'छात्र', 'करियर'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'मुख्य कॉलेज, कोर्स विकल्प और एडमिशन प्लानिंग के लिए आसान गाइड।'
      },
      {
        title: 'नालंदा की विरासत: आज भी क्यों महत्वपूर्ण',
        category: 'इतिहास',
        tags: ['नालंदा', 'विरासत', 'सभ्यता'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'प्राचीन बिहार की ऐतिहासिक विरासत और उसके वैश्विक महत्व को सरल तरीके से समझें।'
      },
      {
        title: 'वाल्मीकि ईको ट्रेल: प्रकृति और सुरक्षित यात्रा',
        category: 'पर्यटन',
        tags: ['वाल्मीकि', 'वन्यजीव', 'ईको टूरिज्म'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'प्रकृति प्रेमियों के लिए समय, गाइड सपोर्ट और स्थानीय ठहराव के साथ एक उपयोगी यात्रा प्लान।'
      },
      {
        title: 'पटना साहिब आध्यात्मिक रूट: पहली यात्रा के लिए गाइड',
        category: 'आध्यात्मिक',
        tags: ['पटना साहिब', 'आस्था', 'तीर्थ'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'दर्शन, समय और पुराने शहर में यात्रा प्रबंधन के लिए सरल व सम्मानजनक मार्गदर्शिका।'
      },
      {
        title: 'बिहार स्टार्टअप स्टोरीज़: लोकल ब्रांड का डिजिटल सफर',
        category: 'बिजनेस',
        tags: ['स्टार्टअप', 'विकास', 'डिजिटल'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'किस तरह बिहार के नए उद्यमी कंटेंट और समुदाय के साथ जिम्मेदार तरीके से आगे बढ़ रहे हैं।'
      },
      {
        title: 'बिहार के त्योहारों की मिठाइयां: ठेकुआ से खाजा तक',
        category: 'खानपान',
        tags: ['मिठाई', 'त्योहार', 'स्थानीय'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1505253213348-cd54c92b37be?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'लोकप्रिय पारंपरिक मिठाइयों का स्वाद और उन्हें कहां सबसे बेहतर तरीके से चखा जा सकता है।'
      },
      {
        title: 'स्टूडेंट रोडमैप: स्कॉलरशिप और स्किल प्रोग्राम',
        category: 'शिक्षा',
        tags: ['स्कॉलरशिप', 'छात्र', 'स्किल'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'छात्रों के लिए किफायती शिक्षा, प्रशिक्षण विकल्प और अगले कदम की उपयोगी जानकारी।'
      },
      {
        title: 'पाटलिपुत्र से पटना: बदलाव की ऐतिहासिक यात्रा',
        category: 'इतिहास',
        tags: ['पाटलिपुत्र', 'इतिहास', 'सभ्यता'],
        url: '#blog',
        img: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1400&q=80',
        excerpt: 'प्राचीन केंद्र से आधुनिक शहर तक पटना के विकास की समयरेखा को संक्षेप में समझें।'
      }
    ]
  };

  const blogGrid = document.querySelector('[data-blog-grid]');
  const featuredWrap = document.querySelector('[data-featured-post]');
  const recentWrap = document.querySelector('[data-blog-recent]');
  const tagCloud = document.querySelector('[data-tag-cloud]');
  const blogSearch = document.querySelector('[data-blog-search]');
  const blogCatBtns = $$('.chip[data-blog-cat]');
  let activeBlogCat = 'all';
  let activeTag = '';
  const getContentLang = () => (lang === 'en' ? 'en' : 'hi');
  const getCustomPosts = () => {
    const raw = readStoredArray(CUSTOM_POSTS_KEY);
    return raw
      .map((x) => ({
        title: String(x.title || '').trim(),
        category: String(x.category || 'Tourism').trim(),
        tags: Array.isArray(x.tags) && x.tags.length ? x.tags : ['bihar'],
        url: String(x.url || '#blog').trim(),
        img: String(x.image || '').trim(),
        excerpt: String(x.excerpt || '').trim(),
        featured: false
      }))
      .filter((x) => x.title && x.img && x.excerpt);
  };
  const getBlogPostsForLang = () => {
    const base = postsByLang[getContentLang()] || postsByLang.en;
    const custom = getCustomPosts();
    return [...custom, ...base];
  };

  const renderTagCloud = () => {
    if (!tagCloud) return;
    const counts = new Map();
    const posts = getBlogPostsForLang();
    posts.forEach((p) => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    const tags = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([t]) => t);

    tagCloud.innerHTML = tags
      .map(
        (t) =>
          `<button class="tag-btn" type="button" data-tag="${escapeHtml(t)}" aria-pressed="${t === activeTag}">#${escapeHtml(t)}</button>`
      )
      .join('');
  };

  const renderRecent = (items) => {
    if (!recentWrap) return;
    const readLabel = lang === 'en' ? 'Read' : 'पढ़ें';
    const openPostLabel = lang === 'en' ? 'Open post' : 'पोस्ट खोलें';
    recentWrap.innerHTML = items
      .slice(0, 6)
      .map(
        (p) => `
          <a class="recent-item" href="${escapeHtml(sanitizeLinkHref(p.url || '#blog'))}" aria-label="${openPostLabel}: ${escapeHtml(p.title)}">
            <div>
              <div class="recent-item__title">${escapeHtml(p.title)}</div>
              <div class="recent-item__meta">${escapeHtml(p.category)} · ${escapeHtml((Array.isArray(p.tags) ? p.tags[0] : '') || '')}</div>
            </div>
            <span class="tag">${readLabel}</span>
          </a>
        `
      )
      .join('');
  };

  const renderFeatured = (items) => {
    if (!featuredWrap) return;
    const featured = items.find((p) => p.featured) || items[0];
    const featuredLabel = lang === 'en' ? 'Featured' : 'फीचर्ड';
    if (!featured) {
      featuredWrap.innerHTML = '';
      return;
    }
    const readMoreLabel = lang === 'en' ? 'Read Full Story' : 'पूरा पढ़ें';

    const featuredImg = sanitizeMediaUrl(featured.img || '');
    if (!featuredImg) return;
    featuredWrap.innerHTML = `
      <article class="post post--featured">
        <img class="post__img" alt="${escapeHtml(featured.title)}" src="${featuredImg}" loading="lazy" decoding="async" />
        <div class="post__body">
          <div class="post__meta">
            <span class="tag">${featuredLabel}</span>
            <span class="tag">${escapeHtml(featured.category)}</span>
            ${(Array.isArray(featured.tags) ? featured.tags : []).slice(0, 2).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <h3 class="post__title">${escapeHtml(featured.title)}</h3>
          <p class="muted">${escapeHtml(featured.excerpt)}</p>
          <div class="post__actions">
            <a class="post__link" href="${escapeHtml(sanitizeLinkHref(featured.url || '#blog'))}">${readMoreLabel}</a>
          </div>
        </div>
      </article>
    `;
  };

  const renderPosts = () => {
    if (!blogGrid) return;
    const q = (blogSearch?.value || '').trim().toLowerCase();
    const cat = activeBlogCat;

    const posts = getBlogPostsForLang();
    const filtered = posts.filter((p) => {
      const hiCategoryToKey = {
        'संस्कृति': 'culture',
        'पर्यटन': 'tourism',
        'स्थानीय समाचार': 'local news',
        'बिजनेस': 'business',
        'खानपान': 'food',
        'आध्यात्मिक': 'spiritual',
        'शिक्षा': 'education',
        'इतिहास': 'history'
      };
      const postCatKey = lang !== 'en'
        ? (hiCategoryToKey[p.category] || p.category.toLowerCase())
        : p.category.toLowerCase();
      const okCat = cat === 'all' || postCatKey === cat;
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const okTag = !activeTag || tags.includes(activeTag);
      const blob = `${p.title} ${p.category} ${tags.join(' ')} ${p.excerpt}`.toLowerCase();
      const okQ = !q || blob.includes(q);
      return okCat && okTag && okQ;
    });

    renderFeatured(filtered);
    renderRecent(filtered);
    renderTagCloud();
    const readMoreLabel = lang === 'en' ? 'Read Full Story' : 'पूरा पढ़ें';
    const noPostsLabel = lang === 'en'
      ? 'No posts found for this category. Try another filter or search.'
      : 'इस श्रेणी के लिए कोई पोस्ट नहीं मिला। कृपया दूसरा फ़िल्टर चुनें।';

    if (!filtered.length) {
      blogGrid.innerHTML = `<article class="post"><div class="post__body"><p class="muted">${noPostsLabel}</p></div></article>`;
      return;
    }

    const adLabel = lang === 'en' ? 'Sponsored' : 'प्रायोजित';
    const adCopy = lang === 'en'
      ? 'Ad slot: Blog In-Feed Partner Card'
      : 'विज्ञापन स्लॉट: ब्लॉग इन-फीड पार्टनर कार्ड';
    const adCta = lang === 'en' ? 'Book This Ad' : 'यह विज्ञापन बुक करें';
    const cards = [];
    filtered.forEach((p, idx) => {
      const img = sanitizeMediaUrl(p.img || '');
      if (!img) return;
      cards.push(`
        <article class="post">
          <img class="post__img" alt="${escapeHtml(p.title)}" src="${img}" loading="lazy" decoding="async" />
          <div class="post__body">
            <div class="post__meta">
              <span class="tag">${escapeHtml(p.category)}</span>
              ${(Array.isArray(p.tags) ? p.tags : []).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <h3 class="post__title">${escapeHtml(p.title)}</h3>
            <p class="muted">${escapeHtml(p.excerpt)}</p>
            <div class="post__actions">
              <a class="post__link" href="${escapeHtml(sanitizeLinkHref(p.url || '#blog'))}">${readMoreLabel}</a>
            </div>
          </div>
        </article>
      `);
      if ((idx + 1) % 6 === 0) {
        cards.push(`
          <article class="post post--ad" data-ad-slot="blog-feed-inline" data-ad-target="contact-us.html" tabindex="0" role="link" aria-label="Blog in-feed ad slot">
            <div class="post__body">
              <div class="ad-slot__label">${adLabel}</div>
              <h3 class="post__title">Featured Partner Placement</h3>
              <p class="muted">${adCopy}</p>
              <div class="post__actions">
                <a class="post__link" href="contact-us.html">${adCta}</a>
              </div>
            </div>
          </article>
        `);
      }
    });
    blogGrid.innerHTML = cards.join('');
    bindAdSlots(blogGrid);
  };

  blogCatBtns.forEach((b) =>
    b.addEventListener('click', () => {
      blogCatBtns.forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      activeBlogCat = (b.getAttribute('data-blog-cat') || 'all').toLowerCase();
      activeTag = '';
      renderPosts();
    })
  );
  blogSearch?.addEventListener('input', renderPosts);

  tagCloud?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;
    const tag = String(btn.getAttribute('data-tag') || '');
    activeTag = activeTag === tag ? '' : tag;
    renderPosts();
  });

  renderPosts();

  // Full-site language switch (EN/HI)
  const langBtn = document.querySelector('[data-lang-toggle]');
  const pageI18n = {
    en: {
      text: {
        '.skip-link': 'Skip to content',
        '.lang__label': 'Language',
        '.nav__link[href="#home"], .nav__link[href="index.html#home"], .nav__link[href="index.php#home"], .nav__link[href="index.html"], .nav__link[href="index.php"]': 'Home',
        '.nav__link[href="#portfolio"], .nav__link[href="index.html#portfolio"], .nav__link[href="index.php#portfolio"]': 'Explore',
        '.nav__link[href="#services"], .nav__link[href="index.html#services"], .nav__link[href="index.php#services"]': 'Services',
        '.nav__link[href="#blog"], .nav__link[href="blog.html"], .nav__link[href="blog.php"], .nav__link[href="index.html#blog"], .nav__link[href="index.php#blog"]': 'Blog',
        '.nav__link[href="media-gallery.html"], .nav__link[href="media-gallery.php"]': 'Media Gallery',
        '.nav__link[href="#about"], .nav__link[href="index.html#about"], .nav__link[href="index.php#about"]': 'About',
        '.nav__link[href="#contact"], .nav__link[href="index.html#contact"], .nav__link[href="index.php#contact"], .nav__link[href="contact-us.html"], .nav__link[href="contact-us.php"]': 'Contact',
        '.nav__link[href="privacy-policy.html"], .nav__link[href="privacy-policy.php"]': 'Privacy',
        '.nav__link[href="terms-and-conditions.html"], .nav__link[href="terms-and-conditions.php"]': 'Terms',
        '.nav__link[href="disclaimer.html"], .nav__link[href="disclaimer.php"]': 'Disclaimer',
        '[data-open-login]': 'Login',
        '.nav__actions [data-open-signup]': 'Sign Up',
        '[data-open-admin]': 'Admin',
        '.search .btn': 'Search',
        '#portfolio .h2': 'Top Favorite Destinations in Bihar',
        '#portfolio .section-head .muted': 'Handpicked places across Bihar for heritage lovers, cultural explorers, and first-time travelers.',
        '.chip[data-filter="all"]': 'All',
        '.chip[data-filter="landmarks"]': 'Landmarks',
        '.chip[data-filter="festivals"]': 'Festivals',
        '.chip[data-filter="cuisine"]': 'Cuisine',
        '.chip[data-filter="culture"]': 'Culture',
        '.spotlight__card:nth-of-type(1) .h3': 'Plan Your Bihar Journey',
        '.spotlight__card:nth-of-type(1) .muted': 'Route ideas, local tips, and practical picks for a memorable Bihar experience.',
        '.kpi:nth-of-type(1) .kpi__label': 'Top destinations',
        '.kpi:nth-of-type(2) .kpi__label': 'Media stories',
        '.kpi:nth-of-type(3) .kpi__label': 'Business partners',
        '.spotlight__card:nth-of-type(2) .h3': 'Travel Snapshot',
        '#services .h2': '🚀 Our Services',
        '#services .section-head .muted': 'Creative production, performance advertising, offline reach, and branding solutions to scale your presence.',
        '#services .card:nth-of-type(1) .h3': 'Ad Production',
        '#services .card:nth-of-type(1) .muted:nth-of-type(1)': 'Bring your brand story to life with cinematic visuals and premium-quality content.',
        '#services .card:nth-of-type(1) .muted:nth-of-type(2)': 'We craft compelling videos and stunning imagery that connect with your audience and elevate your brand presence.',
        '#services .card:nth-of-type(1) .list li:nth-child(1)': 'Corporate Videography',
        '#services .card:nth-of-type(1) .list li:nth-child(2)': 'Commercial Ad Films',
        '#services .card:nth-of-type(1) .list li:nth-child(3)': 'Product Photography',
        '#services .card:nth-of-type(1) .list li:nth-child(4)': 'Social Media Content Creation',
        '#services .card:nth-of-type(1) .list li:nth-child(5)': 'Event Coverage',
        '#services .card:nth-of-type(1) .muted strong': 'Investment starting from ₹9,999/-',
        '#services .card:nth-of-type(2) .h3': 'Online Advertising',
        '#services .card:nth-of-type(2) .muted': 'Grow your brand with performance-driven digital marketing strategies designed for maximum impact and measurable results.',
        '#services .card:nth-of-type(2) .list li:nth-child(1)': 'Pay Per Click Advertising',
        '#services .card:nth-of-type(2) .list li:nth-child(2)': 'Online Advertising Campaigns',
        '#services .card:nth-of-type(2) .list li:nth-child(3)': 'Influencer Marketing',
        '#services .card:nth-of-type(2) .list li:nth-child(4)': 'Social Media Marketing',
        '#services .card:nth-of-type(2) .list li:nth-child(5)': 'Online Reputation Management',
        '#services .card:nth-of-type(2) .list li:nth-child(6)': 'Website Design & Development',
        '#services .card:nth-of-type(2) .muted strong': 'Investment starting from ₹4,999/-',
        '#services .card:nth-of-type(3) .h3': 'Offline Advertising',
        '#services .card:nth-of-type(3) .muted': 'Make a powerful impression beyond the screen with high-visibility traditional advertising solutions.',
        '#services .card:nth-of-type(3) .list li:nth-child(1)': 'TV, Radio & Newspaper Advertising',
        '#services .card:nth-of-type(3) .list li:nth-child(2)': 'Movie Theatre Advertising',
        '#services .card:nth-of-type(3) .list li:nth-child(3)': 'Hoardings & Outdoor Media',
        '#services .card:nth-of-type(3) .list li:nth-child(4)': 'Print Advertising',
        '#services .card:nth-of-type(3) .list li:nth-child(5)': 'Canter Activities',
        '#services .card:nth-of-type(3) .list li:nth-child(6)': 'Strategic Sponsorships',
        '#services .card:nth-of-type(4) .h3': 'Branding & Designing',
        '#services .card:nth-of-type(4) .muted': 'Craft a distinctive and unforgettable brand identity that sets you apart in the market.',
        '#services .card:nth-of-type(4) .list:nth-of-type(1) li:nth-child(1)': 'Premium Logo Design',
        '#services .card:nth-of-type(4) .list:nth-of-type(1) li:nth-child(2)': 'Posters, Banners & Flyer Design',
        '#services .card:nth-of-type(4) .list:nth-of-type(1) li:nth-child(3)': 'Complete Brand Positioning',
        '#services .card:nth-of-type(4) .list:nth-of-type(1) li:nth-child(4)': 'Social Media Branding',
        '#services .card:nth-of-type(4) .h3:nth-of-type(2)': 'Talent Showcase',
        '#services .card:nth-of-type(4) .list:nth-of-type(2) li:nth-child(1)': 'Local artists & performers',
        '#services .card:nth-of-type(4) .list:nth-of-type(2) li:nth-child(2)': 'Collaboration opportunities',
        '#services .card:nth-of-type(4) .list:nth-of-type(2) li:nth-child(3)': 'Portfolio-ready profiles',
        '#blog .h2': 'Blog',
        '#blog .section-head .muted': 'Articles by category, featured stories, and latest Bihar updates.',
        '.chip[data-blog-cat="all"]': 'All',
        '.chip[data-blog-cat="culture"]': 'Culture',
        '.chip[data-blog-cat="tourism"]': 'Tourism',
        '.chip[data-blog-cat="local news"]': 'Local News',
        '.chip[data-blog-cat="business"]': 'Business',
        '.chip[data-blog-cat="food"]': 'Food',
        '.chip[data-blog-cat="spiritual"]': 'Spiritual',
        '.chip[data-blog-cat="education"]': 'Education',
        '.chip[data-blog-cat="history"]': 'History',
        '.blog-side .card:nth-of-type(1) .h3': 'Recent Posts',
        '.blog-side .card:nth-of-type(2) .h3': 'Tags',
        '#testimonials .h2': 'What People Say',
        '#testimonials .section-head .muted': 'Real feedback from travelers, students, and local partners.',
        '[data-testimonial-form] .h3': 'Share Your Experience',
        '[data-testimonial-form] .field:nth-of-type(1) span': 'Name',
        '[data-testimonial-form] .field:nth-of-type(2) span': 'Email',
        '[data-testimonial-form] .field:nth-of-type(3) span': 'Role',
        '[data-testimonial-form] .field:nth-of-type(4) span': 'City',
        '[data-testimonial-form] .field:nth-of-type(5) span': 'Feedback',
        '[data-testimonial-form] .btn--primary': 'Submit Feedback',
        '#about .h2': 'About us',
        '#about .lead': 'Bihar Vihaan was founded on 1st April 2023 by Kaushal Kishor Gupta with a bold vision: to illuminate the rich, vibrant, and often overlooked culture, history, tourism, and talent of Bihar.',
        '#about .block:nth-of-type(1) .h3': 'A New Beginning',
        '#about .block:nth-of-type(1) p': '"Vihaan" means a new beginning-and that\'s what we strive to bring for Bihar through the power of digital media, community-driven content, and technological innovation.',
        '#about .block:nth-of-type(2) .h3': 'Our Platform',
        '#about .block:nth-of-type(2) p': 'Based in Patna, our platform is not just another media outlet-it is a movement, a voice for the people, and a stage for talent that mainstream media often ignores.',
        '#about .about__side .h3': 'Our team',
        '#about .about__side .muted': 'Meet the creators and changemakers behind Bihar Vihaan, building Bihar\'s digital story with creativity, culture, and impact.',
        '#about .about__team .btn--soft': 'Apply for Bihar Vihaan Internship',
        '.person:nth-of-type(1) .person__role': 'Website Developer',
        '.person:nth-of-type(2) .person__role': 'Social Media Manager',
        '.person:nth-of-type(3) .person__role': 'Video Journalist',
        '.person:nth-of-type(4) .person__role': 'Content Strategist',
        '.person:nth-of-type(5) .person__role': 'Graphic Designer',
        '.person:nth-of-type(6) .person__role': 'Operations Coordinator',
        '#contact .h2': 'Contact us',
        '#contact .section-head .muted': 'To unfold the unrevealed sagas of Bihar\'s legacy. We\'ll bring out to you the hidden heritage and diversified culture of Bihar, celebrating its bequest, with language and literature, modern and ancient art, folk music, tourism, theatre, traditional cuisine and festivals that convey its cultural and ethnic diversity.',
        '#contact .contact__info .h3': 'Contact Info',
        'label[for="contactName"]': 'Name',
        'label[for="contactEmail"]': 'Email',
        'label[for="contactSubject"]': 'Subject',
        'label[for="contactMessage"]': 'Message',
        '.contact .form .btn--primary': 'Send message',
        '.contact__info .h3': 'Contact Details',
        '.info__row:nth-of-type(1) .info__k': 'Phone',
        '.info__row:nth-of-type(2) .info__k': 'Email',
        '.info__row:nth-of-type(2) .info__v a': 'Send an email',
        '.info__row:nth-of-type(3) .info__k': 'Address',
        '.footer__title:nth-of-type(1)': 'Explore',
        '.footer__title:nth-of-type(2)': 'Policies',
        '.footer__title:nth-of-type(3)': 'Social',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(1)': 'Home',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(2)': 'Explore Bihar',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(3)': 'Blog',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(4)': 'Media Gallery',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(5)': 'Services',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(6)': 'Advertising',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(7)': 'Marketplace',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(1)': 'Privacy Policy',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(2)': 'Terms & Conditions',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(3)': 'Disclaimer',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(4)': 'Contact Us',
        '.footer__col:nth-of-type(4) .footer__link:nth-of-type(1)': 'Facebook',
        '.footer__col:nth-of-type(4) .footer__link:nth-of-type(2)': 'YouTube',
        '.footer__col:nth-of-type(4) .footer__link:nth-of-type(3)': 'Instagram',
        '.footer__col:nth-of-type(4) .footer__link:nth-of-type(4)': 'LinkedIn',
        '.footer__col:nth-of-type(4) .footer__link:nth-of-type(5)': 'Pinterest',
        '.footer__bottom .muted': '2026 Bihar Vihaan. All Rights Reserved.',
        '[data-to-top]': 'Back to top',
        '[data-modal="login"] .h3': 'Login',
        '[data-modal="login"] .field:nth-of-type(1) label': 'Email',
        '[data-modal="login"] .field:nth-of-type(2) label': 'Password',
        '[data-modal="login"] .modal__body .modal__note:nth-of-type(1) a': 'Forgot Password?',
        '[data-modal="login"] .auth-switch-copy': "Don't have account?",
        '[data-modal="login"] [data-switch-modal="signup"]': 'Sign Up',
        '[data-modal="login"] .modal__actions .btn--primary': 'Login',
        '[data-modal="login"] .modal__actions .btn--ghost': 'Cancel',
        '[data-modal="login"] .modal__note.muted': 'Authentication is managed from the Admin Firebase panel.',
        '[data-modal="signup"] .h3': 'Sign Up',
        '[data-modal="signup"] .field:nth-of-type(1) label': 'Name',
        '[data-modal="signup"] .field:nth-of-type(2) label': 'Email',
        '[data-modal="signup"] .field:nth-of-type(3) label': 'Password',
        '[data-modal="signup"] .field:nth-of-type(4) label': 'Confirm Password',
        '[data-modal="signup"] .auth-switch-copy': 'Already have account?',
        '[data-modal="signup"] [data-switch-modal="login"]': 'Login',
        '[data-modal="signup"] .modal__actions .btn--primary': 'Create Account',
        '[data-modal="signup"] .modal__actions .btn--ghost': 'Cancel',
        '[data-modal="signup"] .modal__note.muted': 'Authentication is managed from the Admin Firebase panel.',
        '[data-modal="admin-login"] .h3': 'Admin Login',
        '[data-modal="admin-login"] .field:nth-of-type(1) label': 'Username',
        '[data-modal="admin-login"] .field:nth-of-type(2) label': 'Password',
        '[data-modal="admin-login"] .modal__actions .btn--primary': 'Login as Admin',
        '[data-modal="admin-login"] .modal__actions .btn--soft': 'Sign Up as Admin',
        '[data-modal="admin-login"] .modal__actions .btn--ghost': 'Cancel',
        '[data-modal="admin-login"] .modal__note:nth-of-type(1) a': 'वापस Home पर जाएं',
        '[data-modal="admin-login"] .modal__note.muted': 'Admin access uses secure PHP session authentication.',
        '[data-modal="contribute"] .h3': 'Contribute your photo/video',
        '[data-modal="contribute"] .field:nth-of-type(1) label': 'Title',
        '[data-modal="contribute"] .field:nth-of-type(2) label': 'Category',
        '[data-modal="contribute"] .field:nth-of-type(3) label': 'Upload',
        '[data-modal="contribute"] .modal__actions .btn--primary': 'Submit',
        '[data-modal="contribute"] .modal__actions .btn--ghost': 'Cancel',
        '[data-modal="contribute"] .modal__note': 'UI-only: add storage + moderation later.',
        '[data-modal="spotlight"] .spotlight-modal__actions .btn--soft': 'Plan a visit',
        '[data-modal="spotlight"] .spotlight-modal__actions .btn--ghost': 'Close'
      },
      attr: {
        'html': { lang: 'en' },
        '[data-lang-toggle]': { 'aria-label': 'Toggle language' },
        '.nav .sr-only': { textContent: 'Open menu' },
        '#globalSearch': { placeholder: 'Search places, businesses, events, guides...' },
        '#gallerySearch': { placeholder: 'Search in gallery...' },
        '#blogSearch': { placeholder: 'Search posts...' },
        '#name': { placeholder: 'Your name' },
        '#email': { placeholder: 'you@example.com' },
        '#subject': { placeholder: 'How can we help?' },
        '#message': { placeholder: 'Write your message...' },
        '#contactName': { placeholder: 'Your name' },
        '#contactEmail': { placeholder: 'you@example.com' },
        '#contactSubject': { placeholder: 'How can we help?' },
        '#contactMessage': { placeholder: 'Write your message...' },
        '#loginEmail': { placeholder: 'you@example.com' },
        '#loginPass': { placeholder: '........' },
        '#signupName': { placeholder: 'Your name' },
        '#signupEmail': { placeholder: 'you@example.com' },
        '#signupPass': { placeholder: '........' },
        '#signupPass2': { placeholder: '........' },
        '#adminUser': { placeholder: 'Enter username' },
        '#adminPass': { placeholder: '........' },
        '[data-testimonial-form] [name="name"]': { placeholder: 'Your name' },
        '[data-testimonial-form] [name="email"]': { placeholder: 'you@example.com' },
        '[data-testimonial-form] [name="quote"]': { placeholder: 'Write your experience...' },
        '#contribTitle': { placeholder: 'e.g., Chhath Puja at Ganga Ghat' },
        '#spotlightSearch': { placeholder: '' }
      },
      options: {
        '[data-testimonial-form] [name="role"] option:nth-of-type(1)': 'Select role',
        '[data-testimonial-form] [name="role"] option:nth-of-type(2)': 'Traveler',
        '[data-testimonial-form] [name="role"] option:nth-of-type(3)': 'Student',
        '[data-testimonial-form] [name="role"] option:nth-of-type(4)': 'Local Business Owner',
        '[data-testimonial-form] [name="role"] option:nth-of-type(5)': 'Tour Guide',
        '[data-testimonial-form] [name="role"] option:nth-of-type(6)': 'Photographer',
        '[data-testimonial-form] [name="city"] option:nth-of-type(1)': 'Select city',
        '[data-testimonial-form] [name="city"] option:nth-of-type(2)': 'Patna',
        '[data-testimonial-form] [name="city"] option:nth-of-type(3)': 'Delhi',
        '[data-testimonial-form] [name="city"] option:nth-of-type(4)': 'Bodh Gaya',
        '#contribCat option:nth-of-type(1)': 'Select...',
        '#contribCat option:nth-of-type(2)': 'Landmarks',
        '#contribCat option:nth-of-type(3)': 'Festivals',
        '#contribCat option:nth-of-type(4)': 'Cuisine',
        '#contribCat option:nth-of-type(5)': 'Culture'
      }
    },
    hi: {
      text: {
        '.skip-link': 'मुख्य सामग्री पर जाएं',
        '.lang__label': 'भाषा',
        '.nav__link[href="#home"], .nav__link[href="index.html#home"], .nav__link[href="index.php#home"], .nav__link[href="index.html"], .nav__link[href="index.php"]': 'होम',
        '.nav__link[href="#portfolio"], .nav__link[href="index.html#portfolio"], .nav__link[href="index.php#portfolio"]': 'एक्सप्लोर',
        '.nav__link[href="#services"], .nav__link[href="index.html#services"], .nav__link[href="index.php#services"]': 'सेवाएं',
        '.nav__link[href="#blog"], .nav__link[href="blog.html"], .nav__link[href="blog.php"], .nav__link[href="index.html#blog"], .nav__link[href="index.php#blog"]': 'ब्लॉग',
        '.nav__link[href="media-gallery.html"], .nav__link[href="media-gallery.php"]': 'मीडिया गैलरी',
        '.nav__link[href="#about"], .nav__link[href="index.html#about"], .nav__link[href="index.php#about"]': 'हमारे बारे में',
        '.nav__link[href="#contact"], .nav__link[href="index.html#contact"], .nav__link[href="index.php#contact"], .nav__link[href="contact-us.html"], .nav__link[href="contact-us.php"]': 'संपर्क',
        '.nav__link[href="privacy-policy.html"], .nav__link[href="privacy-policy.php"]': 'प्राइवेसी',
        '.nav__link[href="terms-and-conditions.html"], .nav__link[href="terms-and-conditions.php"]': 'नियम',
        '.nav__link[href="disclaimer.html"], .nav__link[href="disclaimer.php"]': 'डिस्क्लेमर',
        '[data-open-login]': 'लॉगिन',
        '.nav__actions [data-open-signup]': 'साइन अप',
        '[data-open-admin]': 'एडमिन',
        '.search .btn': 'खोजें',
        '#portfolio .h2': 'बिहार के शीर्ष पसंदीदा गंतव्य',
        '#portfolio .section-head .muted': 'बिहार के चुने हुए स्थान, विरासत और यात्रा अनुभव एक ही जगह।',
        '.chip[data-filter="all"]': 'सभी',
        '.chip[data-filter="landmarks"]': 'स्थल',
        '.chip[data-filter="festivals"]': 'त्योहार',
        '.chip[data-filter="cuisine"]': 'खानपान',
        '.chip[data-filter="culture"]': 'संस्कृति',
        '.spotlight__card:nth-of-type(1) .h3': 'अपनी बिहार यात्रा प्लान करें',
        '.spotlight__card:nth-of-type(1) .muted': 'रूट आइडिया, स्थानीय टिप्स और व्यावहारिक यात्रा सुझाव एक ही जगह।',
        '.kpi:nth-of-type(1) .kpi__label': 'टॉप डेस्टिनेशंस',
        '.kpi:nth-of-type(2) .kpi__label': 'मीडिया स्टोरीज़',
        '.kpi:nth-of-type(3) .kpi__label': 'बिज़नेस पार्टनर्स',
        '.spotlight__card:nth-of-type(2) .h3': 'ट्रैवल स्नैपशॉट',
        '#services .h2': 'सेवाएं',
        '#services .section-head .muted': 'ब्रांड, क्रिएटर्स और स्थानीय व्यवसायों के लिए क्रिएटिव और विज्ञापन सेवाएं।',
        '#services .card:nth-of-type(1) .h3': 'डिजिटल सेवाएं',
        '#services .card:nth-of-type(1) .list li:nth-child(1)': 'ब्रांडिंग और डिजाइनिंग',
        '#services .card:nth-of-type(1) .list li:nth-child(2)': 'लोगो डिजाइन',
        '#services .card:nth-of-type(1) .list li:nth-child(3)': 'सोशल मीडिया क्रिएटिव्स',
        '#services .card:nth-of-type(1) .list li:nth-child(4)': 'ब्रांड आइडेंटिटी सिस्टम',
        '#services .card:nth-of-type(1) .card__link': 'ब्रांड प्रोजेक्ट शुरू करें',
        '#services .card:nth-of-type(2) .h3': 'विज्ञापन सेवाएं',
        '#services .card:nth-of-type(2) .list li:nth-child(1)': 'एड प्रोडक्शन',
        '#services .card:nth-of-type(2) .list li:nth-child(2)': 'वीडियो एड्स और रील्स',
        '#services .card:nth-of-type(2) .list li:nth-child(3)': 'ऑनलाइन विज्ञापन (Facebook, Instagram, Google)',
        '#services .card:nth-of-type(2) .list li:nth-child(4)': 'ऑफलाइन विज्ञापन (पोस्टर, बैनर, होर्डिंग)',
        '#services .card:nth-of-type(2) .card__link': 'एड कैंपेन शुरू करें',
        '#services .card:nth-of-type(3) .h3': 'प्रतिभा प्रदर्शन',
        '#services .card:nth-of-type(3) .list li:nth-child(1)': 'स्थानीय कलाकार और प्रस्तोता',
        '#services .card:nth-of-type(3) .list li:nth-child(2)': 'सहयोग के अवसर',
        '#services .card:nth-of-type(3) .list li:nth-child(3)': 'पोर्टफोलियो-तैयार प्रोफाइल',
        '#services .card:nth-of-type(3) .card__link': 'प्रतिभा देखें',
        '#services .card:nth-of-type(4) .h3': 'इवेंट प्रोत्साहन',
        '#services .card:nth-of-type(4) .list li:nth-child(1)': 'इवेंट कैलेंडर',
        '#services .card:nth-of-type(4) .list li:nth-child(2)': 'रजिस्ट्रेशन लिंक',
        '#services .card:nth-of-type(4) .list li:nth-child(3)': 'फीचर्ड इवेंट अभियान',
        '#services .card:nth-of-type(4) .card__link': 'इवेंट सबमिट करें',
        '.calendar__head .h3': 'इवेंट कैलेंडर',
        '.event:nth-of-type(1) .event__title': 'हेरिटेज वॉक - पटना',
        '.event:nth-of-type(1) .event__meta': 'पर्यटन - पंजीकरण खुला है',
        '.event:nth-of-type(2) .event__title': 'मधुबनी कार्यशाला',
        '.event:nth-of-type(2) .event__meta': 'संस्कृति - सीमित सीटें',
        '.event:nth-of-type(3) .event__title': 'स्थानीय व्यवसाय मीटअप',
        '.event:nth-of-type(3) .event__meta': 'बिजनेस - नेटवर्किंग',
        '.event__cta': 'रजिस्टर करें',
        '#blog .h2': 'ब्लॉग',
        '#blog .section-head .muted': 'कैटेगरी-वाइज लेख, फीचर्ड पोस्ट और बिहार के ताज़ा अपडेट्स।',
        '.chip[data-blog-cat="all"]': 'सभी',
        '.chip[data-blog-cat="culture"]': 'संस्कृति',
        '.chip[data-blog-cat="tourism"]': 'पर्यटन',
        '.chip[data-blog-cat="local news"]': 'स्थानीय समाचार',
        '.chip[data-blog-cat="business"]': 'बिजनेस',
        '.chip[data-blog-cat="food"]': 'खानपान',
        '.chip[data-blog-cat="spiritual"]': 'आध्यात्मिक',
        '.chip[data-blog-cat="education"]': 'शिक्षा',
        '.chip[data-blog-cat="history"]': 'इतिहास',
        '.blog-side .card:nth-of-type(1) .h3': 'हालिया पोस्ट',
        '.blog-side .card:nth-of-type(2) .h3': 'टैग्स',
        '#testimonials .h2': 'लोग क्या कहते हैं',
        '#testimonials .section-head .muted': 'यात्रियों, छात्रों और स्थानीय पार्टनर्स की वास्तविक प्रतिक्रिया।',
        '[data-testimonial-form] .h3': 'अपना अनुभव साझा करें',
        '[data-testimonial-form] .field:nth-of-type(1) span': 'नाम',
        '[data-testimonial-form] .field:nth-of-type(2) span': 'ईमेल',
        '[data-testimonial-form] .field:nth-of-type(3) span': 'भूमिका',
        '[data-testimonial-form] .field:nth-of-type(4) span': 'शहर',
        '[data-testimonial-form] .field:nth-of-type(5) span': 'फीडबैक',
        '[data-testimonial-form] .btn--primary': 'फीडबैक सबमिट करें',
        '#about .h2': 'हमारे बारे में',
        '#about .lead': 'बिहार विहान की स्थापना 1 अप्रैल 2023 को कौशल किशोर गुप्ता द्वारा एक बड़े विजन के साथ की गई: बिहार की समृद्ध, जीवंत और अक्सर अनदेखी संस्कृति, इतिहास, पर्यटन और प्रतिभा को सामने लाना।',
        '#about .block:nth-of-type(1) .h3': 'एक नई शुरुआत',
        '#about .block:nth-of-type(1) p': '"विहान" का अर्थ है नई शुरुआत-और यही हम डिजिटल मीडिया, समुदाय आधारित कंटेंट और तकनीकी नवाचार के जरिए बिहार के लिए लाना चाहते हैं।',
        '#about .block:nth-of-type(2) .h3': 'हमारा प्लेटफॉर्म',
        '#about .block:nth-of-type(2) p': 'पटना स्थित हमारा प्लेटफॉर्म सिर्फ एक मीडिया आउटलेट नहीं है-यह एक आंदोलन है, लोगों की आवाज है और उस प्रतिभा का मंच है जिसे मुख्यधारा मीडिया अक्सर नजरअंदाज करता है।',
        '#about .about__side .h3': 'हमारी टीम',
        '#about .about__side .muted': 'हमारी समर्पित टीम बिहार की पहचान, संस्कृति और कहानियों को दुनिया तक पहुंचाने के लिए लगातार काम कर रही है।',
        '#about .about__team .btn--soft': 'बिहार विहान इंटर्नशिप के लिए आवेदन करें',
        '.person:nth-of-type(1) .person__role': 'वेबसाइट डेवलपर',
        '.person:nth-of-type(2) .person__role': 'सोशल मीडिया मैनेजर',
        '.person:nth-of-type(3) .person__role': 'वीडियो जर्नलिस्ट',
        '.person:nth-of-type(4) .person__role': 'कंटेंट स्ट्रैटेजिस्ट',
        '.person:nth-of-type(5) .person__role': 'ग्राफिक डिजाइनर',
        '.person:nth-of-type(6) .person__role': 'ऑपरेशंस कोऑर्डिनेटर',
        '#contact .h2': 'संपर्क करें',
        '#contact .section-head .muted': 'बिहार की विरासत की अनकही गाथाओं को सामने लाने के लिए। हम भाषा और साहित्य, आधुनिक और प्राचीन कला, लोक संगीत, पर्यटन, थिएटर, पारंपरिक व्यंजन और त्योहारों के माध्यम से बिहार की सांस्कृतिक और जातीय विविधता को आपके सामने लाएंगे।',
        '#contact .contact__info .h3': 'संपर्क जानकारी',
        'label[for="contactName"]': 'नाम',
        'label[for="contactEmail"]': 'ईमेल',
        'label[for="contactSubject"]': 'विषय',
        'label[for="contactMessage"]': 'संदेश',
        '.contact .form .btn--primary': 'संदेश भेजें',
        '.contact__info .h3': 'संपर्क विवरण',
        '.info__row:nth-of-type(1) .info__k': 'फोन',
        '.info__row:nth-of-type(2) .info__k': 'ईमेल',
        '.info__row:nth-of-type(2) .info__v a': 'ईमेल भेजें',
        '.info__row:nth-of-type(3) .info__k': 'पता',
        '.footer__col:nth-of-type(2) .footer__title': 'क्विक लिंक्स',
        '.footer__col:nth-of-type(3) .footer__title': 'लीगल',
        '.footer__col:nth-of-type(4) .footer__title': 'सोशल',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(1)': 'होम',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(2)': 'बिहार एक्सप्लोर करें',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(3)': 'ब्लॉग',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(4)': 'मीडिया गैलरी',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(5)': 'सेवाएं',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(6)': 'विज्ञापन',
        '.footer__col:nth-of-type(2) .footer__link:nth-of-type(7)': 'मार्केटप्लेस',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(1)': 'प्राइवेसी पॉलिसी',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(2)': 'नियम और शर्तें',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(3)': 'डिस्क्लेमर',
        '.footer__col:nth-of-type(3) .footer__link:nth-of-type(4)': 'संपर्क करें',
        '.footer__bottom .muted': '2026 बिहार विहान। सर्वाधिकार सुरक्षित।',
        '[data-to-top]': 'ऊपर जाएं',
        '[data-modal="login"] .h3': 'लॉगिन',
        '[data-modal="login"] .field:nth-of-type(1) label': 'ईमेल',
        '[data-modal="login"] .field:nth-of-type(2) label': 'पासवर्ड',
        '[data-modal="login"] .modal__body .modal__note:nth-of-type(1) a': 'पासवर्ड भूल गए?',
        '[data-modal="login"] .auth-switch-copy': 'अकाउंट नहीं है?',
        '[data-modal="login"] [data-switch-modal="signup"]': 'साइन अप',
        '[data-modal="login"] .modal__actions .btn--primary': 'लॉगिन',
        '[data-modal="login"] .modal__actions .btn--ghost': 'रद्द करें',
        '[data-modal="login"] .modal__note.muted': 'ऑथेंटिकेशन एडमिन Firebase पैनल से नियंत्रित होता है।',
        '[data-modal="signup"] .h3': 'साइन अप',
        '[data-modal="signup"] .field:nth-of-type(1) label': 'नाम',
        '[data-modal="signup"] .field:nth-of-type(2) label': 'ईमेल',
        '[data-modal="signup"] .field:nth-of-type(3) label': 'पासवर्ड',
        '[data-modal="signup"] .field:nth-of-type(4) label': 'पासवर्ड की पुष्टि करें',
        '[data-modal="signup"] .auth-switch-copy': 'पहले से अकाउंट है?',
        '[data-modal="signup"] [data-switch-modal="login"]': 'लॉगिन',
        '[data-modal="signup"] .modal__actions .btn--primary': 'अकाउंट बनाएं',
        '[data-modal="signup"] .modal__actions .btn--ghost': 'रद्द करें',
        '[data-modal="signup"] .modal__note.muted': 'ऑथेंटिकेशन एडमिन Firebase पैनल से नियंत्रित होता है।',
        '[data-modal="admin-login"] .h3': 'एडमिन लॉगिन',
        '[data-modal="admin-login"] .field:nth-of-type(1) label': 'यूज़रनेम',
        '[data-modal="admin-login"] .field:nth-of-type(2) label': 'पासवर्ड',
        '[data-modal="admin-login"] .modal__actions .btn--primary': 'एडमिन के रूप में लॉगिन',
        '[data-modal="admin-login"] .modal__actions .btn--soft': 'एडमिन साइन अप',
        '[data-modal="admin-login"] .modal__actions .btn--ghost': 'रद्द करें',
        '[data-modal="admin-login"] .modal__note:nth-of-type(1) a': 'वापस Home पर जाएं',
        '[data-modal="admin-login"] .modal__note.muted': 'एडमिन एक्सेस सुरक्षित PHP session authentication से सुरक्षित है।',
        '[data-modal="contribute"] .h3': 'अपनी फोटो/वीडियो योगदान करें',
        '[data-modal="contribute"] .field:nth-of-type(1) label': 'शीर्षक',
        '[data-modal="contribute"] .field:nth-of-type(2) label': 'श्रेणी',
        '[data-modal="contribute"] .field:nth-of-type(3) label': 'अपलोड',
        '[data-modal="contribute"] .modal__actions .btn--primary': 'सबमिट करें',
        '[data-modal="contribute"] .modal__actions .btn--ghost': 'रद्द करें',
        '[data-modal="contribute"] .modal__note': 'केवल UI: स्टोरेज और मॉडरेशन बाद में जोड़ें।',
        '[data-modal="spotlight"] .spotlight-modal__actions .btn--soft': 'यात्रा की योजना बनाएं',
        '[data-modal="spotlight"] .spotlight-modal__actions .btn--ghost': 'बंद करें'
      },
      attr: {
        'html': { lang: 'hi' },
        '[data-lang-toggle]': { 'aria-label': 'भाषा बदलें' },
        '.nav .sr-only': { textContent: 'मेनू खोलें' },
        '#globalSearch': { placeholder: 'स्थान, व्यवसाय, इवेंट, गाइड खोजें...' },
        '#gallerySearch': { placeholder: 'गैलरी में खोजें...' },
        '#blogSearch': { placeholder: 'पोस्ट खोजें...' },
        '#name': { placeholder: 'आपका नाम' },
        '#email': { placeholder: 'you@example.com' },
        '#subject': { placeholder: 'हम आपकी कैसे मदद करें?' },
        '#message': { placeholder: 'अपना संदेश लिखें...' },
        '#contactName': { placeholder: 'आपका नाम' },
        '#contactEmail': { placeholder: 'you@example.com' },
        '#contactSubject': { placeholder: 'हम आपकी कैसे मदद करें?' },
        '#contactMessage': { placeholder: 'अपना संदेश लिखें...' },
        '#loginEmail': { placeholder: 'you@example.com' },
        '#loginPass': { placeholder: '........' },
        '#signupName': { placeholder: 'आपका नाम' },
        '#signupEmail': { placeholder: 'you@example.com' },
        '#signupPass': { placeholder: '........' },
        '#signupPass2': { placeholder: '........' },
        '#adminUser': { placeholder: 'यूज़रनेम दर्ज करें' },
        '#adminPass': { placeholder: '........' },
        '[data-testimonial-form] [name="name"]': { placeholder: 'आपका नाम' },
        '[data-testimonial-form] [name="email"]': { placeholder: 'you@example.com' },
        '[data-testimonial-form] [name="quote"]': { placeholder: 'अपना अनुभव लिखें...' },
        '#contribTitle': { placeholder: 'उदा., गंगा घाट पर छठ पूजा' }
      },
      options: {
        '[data-testimonial-form] [name="role"] option:nth-of-type(1)': 'भूमिका चुनें',
        '[data-testimonial-form] [name="role"] option:nth-of-type(2)': 'यात्री',
        '[data-testimonial-form] [name="role"] option:nth-of-type(3)': 'छात्र',
        '[data-testimonial-form] [name="role"] option:nth-of-type(4)': 'स्थानीय व्यवसाय मालिक',
        '[data-testimonial-form] [name="role"] option:nth-of-type(5)': 'टूर गाइड',
        '[data-testimonial-form] [name="role"] option:nth-of-type(6)': 'फोटोग्राफर',
        '[data-testimonial-form] [name="city"] option:nth-of-type(1)': 'शहर चुनें',
        '[data-testimonial-form] [name="city"] option:nth-of-type(2)': 'पटना',
        '[data-testimonial-form] [name="city"] option:nth-of-type(3)': 'दिल्ली',
        '[data-testimonial-form] [name="city"] option:nth-of-type(4)': 'बोधगया',
        '#contribCat option:nth-of-type(1)': 'चुनें...',
        '#contribCat option:nth-of-type(2)': 'स्थल',
        '#contribCat option:nth-of-type(3)': 'त्योहार',
        '#contribCat option:nth-of-type(4)': 'खानपान',
        '#contribCat option:nth-of-type(5)': 'संस्कृति'
      }
    }
  };

  const langCycle = ['en', 'hi'];
  const langMeta = {
    en: { short: 'EN', full: 'English' },
    hi: { short: 'HI', full: 'हिंदी' }
  };
  const getLangFromUrl = () => {
    try {
      const u = new URL(window.location.href);
      const qLang = (u.searchParams.get('lang') || '').trim().toLowerCase();
      if (langCycle.includes(qLang)) return qLang;
      const seg = (u.pathname.split('/').filter(Boolean)[0] || '').trim().toLowerCase();
      if (langCycle.includes(seg)) return seg;
    } catch (_) {
      // Ignore URL parse issues
    }
    return '';
  };
  const updateLangInUrl = (nextLang) => {
    try {
      const u = new URL(window.location.href);
      const segs = u.pathname.split('/').filter(Boolean);
      if (segs.length && langCycle.includes(segs[0])) {
        segs[0] = nextLang;
        u.pathname = `/${segs.join('/')}`;
      } else {
        u.searchParams.set('lang', nextLang);
      }
      window.history.replaceState({}, '', `${u.pathname}${u.search}${u.hash}`);
    } catch (_) {
      // Ignore history/url failures
    }
  };

  const applyLang = () => {
    if (!langCycle.includes(lang)) lang = 'en';
    const pack = pageI18n[lang] || pageI18n.en;

    // Keep existing hero data-i18n mechanism
    const heroDict = {
      hi: {
        'hero.title': 'बिहार का दिल महसूस करें',
        'hero.subtitle': 'स्थल, त्योहार, खानपान, कहानियां और भरोसेमंद स्थानीय व्यवसाय - सब एक ही जगह।',
        'hero.ctaExplore': 'बिहार देखें',
        'hero.ctaBusiness': 'व्यवसाय सूचीबद्ध करें'
      },
      en: {
        'hero.title': siteSettings.heroTitle || defaultSiteSettings.heroTitle,
        'hero.subtitle': siteSettings.heroSubtitle || defaultSiteSettings.heroSubtitle,
        'hero.ctaExplore': siteSettings.ctaPrimary || defaultSiteSettings.ctaPrimary,
        'hero.ctaBusiness': siteSettings.ctaSecondary || defaultSiteSettings.ctaSecondary
      }
    };
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = heroDict[lang]?.[key] || heroDict.hi?.[key] || heroDict.en?.[key];
      if (typeof val === 'string') el.textContent = val;
    });

    Object.entries(pack.text).forEach(([selector, value]) => {
      try {
        const nodes = $$(selector);
        nodes.forEach((node) => {
          node.textContent = value;
        });
      } catch (_) {
        // Ignore invalid selectors so one bad key doesn't break the whole language switch.
      }
    });

    Object.entries(pack.attr).forEach(([selector, attrs]) => {
      try {
        const nodes = $$(selector);
        nodes.forEach((node) => {
          Object.entries(attrs).forEach(([attr, value]) => {
            if (attr === 'textContent') {
              node.textContent = value;
            } else if (attr === 'lang') {
              node.lang = value;
            } else {
              node.setAttribute(attr, value);
            }
          });
        });
      } catch (_) {
        // Ignore invalid selectors so one bad key doesn't break the whole language switch.
      }
    });

    Object.entries(pack.options).forEach(([selector, value]) => {
      try {
        const node = $(selector);
        if (node) node.textContent = value;
      } catch (_) {
        // Ignore invalid selectors so one bad key doesn't break the whole language switch.
      }
    });

    const pill = $('.lang__pill', langBtn || document);
    if (pill) pill.textContent = lang === 'hi' ? 'हिंदी' : 'English';
    const label = $('.lang__label', langBtn || document);
    if (label) {
      label.textContent = lang === 'hi'
        ? 'Language: हिंदी | English'
        : 'Language: हिंदी | English';
    }
    document.documentElement.lang = pack?.attr?.html?.lang || lang;
    try {
      window.localStorage.setItem('bv_lang', lang);
    } catch (_) {
      // Ignore storage failures (private mode / blocked storage).
    }
    applyAdminSiteSettings(lang);
    renderPosts();
  };

  const urlLang = getLangFromUrl();
  if (urlLang && langCycle.includes(urlLang)) {
    lang = urlLang;
  } else {
    try {
      const saved = window.localStorage.getItem('bv_lang');
      if (saved && langCycle.includes(saved)) lang = saved;
    } catch (_) {
      // Ignore storage read failures.
    }
  }

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentIndex = langCycle.indexOf(lang);
      lang = langCycle[(currentIndex + 1) % langCycle.length];
      applyLang();
      updateLangInUrl(lang);
    });
  }

  applyLang();
  applyAdminSiteSettings(lang);
  const darkModeKey = 'bv_theme_mode';
  const applyThemeMode = (mode) => {
    document.documentElement.setAttribute('data-theme-mode', mode);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', mode === 'dark' ? '#0f1318' : '#b63b33');
    }
    const themeToggle = $('[data-theme-toggle]');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(mode === 'dark'));
      themeToggle.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('title', mode === 'dark' ? 'Light mode' : 'Dark mode');
      const label = $('[data-theme-toggle-label]', themeToggle);
      if (label) label.textContent = mode === 'dark' ? '🌛' : '☀️';
    }
  };
  try {
    const storedMode = window.localStorage.getItem(darkModeKey);
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyThemeMode(storedMode === 'dark' || (!storedMode && systemDark) ? 'dark' : 'light');
  } catch (_) {
    applyThemeMode('light');
  }
  $('[data-theme-toggle]')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme-mode') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyThemeMode(next);
    try {
      window.localStorage.setItem(darkModeKey, next);
    } catch (_) {
      // Ignore storage failures.
    }
  });
  const heroVideo = $('.hero__bgVideo');
  if (heroVideo) {
    const reducedData = navigator.connection?.saveData;
    if (reducedData) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    }
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update().catch(() => {}))
        .catch(() => {});
    });
  }
  window.addEventListener('storage', (event) => {
    if (event.key === SITE_SETTINGS_KEY) {
      siteSettings = getAdminSiteSettings();
    } else if (event.key !== CUSTOM_TEAM_KEY) {
      return;
    }
    applyLang();
  });

  // Deep-link recent posts (visual cue only)
  const recent = document.querySelector('[data-recent-posts]');
  if (recent) {
    recent.addEventListener('click', (e) => {
      const a = e.target.closest('[data-post]');
      if (!a) return;
      // Scroll to blog; rendering already happens.
      document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  window.__bvCoreReady = true;
})();
