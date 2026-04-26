import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';

const cfg = window.BV_FIREBASE_CONFIG;
const statusEl = document.querySelector('[data-fb-status]');
const authNote = document.querySelector('[data-fb-auth-note]');
const setStatus = (text, warn = false) => {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('status--warn', warn);
  statusEl.classList.toggle('status--ok', !warn);
};

if (!cfg || !cfg.apiKey) {
  setStatus('Missing config', true);
  if (authNote) authNote.textContent = 'firebase-config.js missing. Add your project credentials to enable live mode.';
  throw new Error('Firebase config missing');
}

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const adminCreateApp = initializeApp(cfg, 'bv-admin-create-user');
const adminCreateAuth = getAuth(adminCreateApp);

const authForm = document.querySelector('[data-fb-auth-form]');
const signOutBtn = document.querySelector('[data-fb-signout]');
const adminCreateForm = document.querySelector('[data-fb-admin-create-form]');
const adminCreateNote = document.querySelector('[data-fb-admin-create-note]');

let currentUser = null;
let isAdmin = false;

const canWrite = () => Boolean(currentUser && isAdmin);

const sanitize = (v) => String(v || '').replace(/[<>]/g, '').trim();
const safeUrl = (v) => {
  const raw = String(v || '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw, window.location.origin);
    if (!['https:', 'http:'].includes(u.protocol)) return '';
    return u.toString();
  } catch (_) {
    return '';
  }
};

const guardWrite = () => {
  if (!canWrite()) {
    setStatus('Auth required', true);
    return false;
  }
  return true;
};

const renderList = (selector, items, mapFn, collectionName) => {
  const wrap = document.querySelector(selector);
  if (!wrap) return;
  if (!items.length) {
    wrap.innerHTML = '<p class="muted">No live records yet.</p>';
    return;
  }
  wrap.innerHTML = items
    .map((x) => {
      const label = mapFn(x);
      return `<div class="admin-item"><strong>${label}</strong><button class="btn btn--ghost" type="button" data-fb-delete data-fb-col="${collectionName}" data-fb-id="${x.id}">Delete</button></div>`;
    })
    .join('');
};

const bindLiveCollections = () => {
  onSnapshot(query(collection(db, 'blog_posts'), orderBy('updated_at', 'desc')), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList('[data-fb-posts-list]', rows, (x) => `${sanitize(x.title)} · ${sanitize(x.category)}`, 'blog_posts');
  });

  onSnapshot(query(collection(db, 'explore_cards'), orderBy('updated_at', 'desc')), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList('[data-fb-explore-list]', rows, (x) => `${sanitize(x.title)} · ${sanitize(x.category)}`, 'explore_cards');
  });

  onSnapshot(query(collection(db, 'ads_campaigns'), orderBy('updated_at', 'desc')), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList('[data-fb-ads-list]', rows, (x) => `${sanitize(x.title)} · ${sanitize(x.placement)}`, 'ads_campaigns');
  });

  onSnapshot(query(collection(db, 'media_items'), orderBy('updated_at', 'desc')), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList('[data-fb-media-list]', rows, (x) => `${sanitize(x.title)} · ${sanitize(x.category)}`, 'media_items');
  });
};

bindLiveCollections();

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    isAdmin = false;
    setStatus('Logged out', true);
    if (authNote) authNote.textContent = 'Login required for live Firestore actions.';
    return;
  }
  const adminDoc = await getDoc(doc(db, 'admin_users', user.uid));
  isAdmin = adminDoc.exists() && Boolean(adminDoc.data().active !== false);
  if (!isAdmin) {
    setStatus('No admin role', true);
    if (authNote) authNote.textContent = 'User authenticated but not authorized. Add user uid to admin_users collection.';
    return;
  }
  setStatus('Connected (Admin)', false);
  if (authNote) authNote.textContent = `Signed in as ${user.email}`;
});

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('fbAdminEmail')?.value || '';
  const password = document.getElementById('fbAdminPassword')?.value || '';
  try {
    await signInWithEmailAndPassword(auth, String(email).trim(), String(password).trim());
  } catch (err) {
    setStatus('Login failed', true);
    if (authNote) authNote.textContent = err?.message || 'Login failed';
  }
});

signOutBtn?.addEventListener('click', async () => {
  await signOut(auth);
});

adminCreateForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardWrite()) {
    if (adminCreateNote) adminCreateNote.textContent = 'Login as admin first to create new admin account.';
    return;
  }
  const name = sanitize(document.getElementById('fbNewAdminName')?.value);
  const email = sanitize(document.getElementById('fbNewAdminEmail')?.value).toLowerCase();
  const password = String(document.getElementById('fbNewAdminPassword')?.value || '').trim();
  const password2 = String(document.getElementById('fbNewAdminPassword2')?.value || '').trim();
  if (!name || !email || !password || !password2) {
    if (adminCreateNote) adminCreateNote.textContent = 'Please fill all fields.';
    return;
  }
  if (password.length < 8) {
    if (adminCreateNote) adminCreateNote.textContent = 'Password must be at least 8 characters.';
    return;
  }
  if (password !== password2) {
    if (adminCreateNote) adminCreateNote.textContent = 'Password and Confirm Password do not match.';
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(adminCreateAuth, email, password);
    await setDoc(
      doc(db, 'admin_users', cred.user.uid),
      {
        name,
        email,
        role: 'admin',
        active: true,
        created_by: currentUser.uid,
        updated_at: serverTimestamp(),
        created_at: serverTimestamp()
      },
      { merge: true }
    );
    await signOut(adminCreateAuth);
    adminCreateForm.reset();
    setStatus('Admin account created', false);
    if (adminCreateNote) adminCreateNote.textContent = `New admin created: ${email}`;
  } catch (err) {
    setStatus('Create admin failed', true);
    if (adminCreateNote) adminCreateNote.textContent = err?.message || 'Unable to create admin account.';
  }
});

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-fb-delete]');
  if (!btn) return;
  if (!guardWrite()) return;
  const col = btn.getAttribute('data-fb-col');
  const id = btn.getAttribute('data-fb-id');
  if (!col || !id) return;
  await deleteDoc(doc(db, col, id));
});

document.querySelector('[data-fb-post-form]')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardWrite()) return;
  const title = sanitize(document.getElementById('fbPostTitle')?.value);
  const category = sanitize(document.getElementById('fbPostCategory')?.value);
  const excerpt = sanitize(document.getElementById('fbPostExcerpt')?.value);
  const image = safeUrl(document.getElementById('fbPostImage')?.value);
  const url = sanitize(document.getElementById('fbPostUrl')?.value);
  const tags = sanitize(document.getElementById('fbPostTags')?.value)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  if (!title || !category || !excerpt || !image || !url) return;
  await addDoc(collection(db, 'blog_posts'), {
    title,
    category,
    excerpt,
    image,
    url,
    tags,
    created_by: currentUser.uid,
    updated_at: serverTimestamp(),
    created_at: serverTimestamp()
  });
  e.target.reset();
});

document.querySelector('[data-fb-explore-form]')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardWrite()) return;
  const title = sanitize(document.getElementById('fbExploreTitle')?.value);
  const category = sanitize(document.getElementById('fbExploreCategory')?.value);
  const image = safeUrl(document.getElementById('fbExploreImage')?.value);
  if (!title || !category || !image) return;
  await addDoc(collection(db, 'explore_cards'), {
    title,
    category,
    image,
    created_by: currentUser.uid,
    updated_at: serverTimestamp(),
    created_at: serverTimestamp()
  });
  e.target.reset();
});

document.querySelector('[data-fb-ads-form]')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardWrite()) return;
  const title = sanitize(document.getElementById('fbAdsTitle')?.value);
  const placement = sanitize(document.getElementById('fbAdsPlacement')?.value);
  const targetUrl = safeUrl(document.getElementById('fbAdsTarget')?.value);
  const budget = sanitize(document.getElementById('fbAdsBudget')?.value);
  if (!title || !placement || !targetUrl) return;
  await addDoc(collection(db, 'ads_campaigns'), {
    title,
    placement,
    target_url: targetUrl,
    budget,
    updated_at: serverTimestamp(),
    created_at: serverTimestamp(),
    created_by: currentUser.uid
  });
  e.target.reset();
});

document.querySelector('[data-fb-media-form]')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardWrite()) return;
  const title = sanitize(document.getElementById('fbMediaTitle')?.value);
  const category = sanitize(document.getElementById('fbMediaCategory')?.value);
  const file = document.getElementById('fbMediaFile')?.files?.[0];
  if (!title || !category || !file) return;
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const fileRef = ref(storage, `media/${fileName}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  await addDoc(collection(db, 'media_items'), {
    title,
    category,
    file_name: fileName,
    url,
    created_by: currentUser.uid,
    updated_at: serverTimestamp(),
    created_at: serverTimestamp()
  });
  e.target.reset();
});

// Optional: seed admin role doc helper (run once manually from console with your uid)
window.bvSetAdminUser = async (uid, email = '') => {
  if (!uid) return;
  await setDoc(doc(db, 'admin_users', uid), {
    email,
    active: true,
    role: 'admin',
    updated_at: serverTimestamp(),
    created_at: serverTimestamp()
  }, { merge: true });
};
