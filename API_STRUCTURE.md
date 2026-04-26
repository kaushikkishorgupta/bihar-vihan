# API / Data Structure (Firebase)

## Client SDK calls (used in admin-firebase.js)

- Auth
  - `signInWithEmailAndPassword(auth, email, password)`
  - `signOut(auth)`
  - `onAuthStateChanged(auth, callback)`

- Firestore collections
  - `blog_posts`
  - `explore_cards`
  - `ads_campaigns`
  - `media_items`
  - `admin_users`

- Storage
  - `media/{timestamp-filename}`

## Logical endpoints (if later moved to Cloud Functions)

- `POST /admin/login`
- `GET /admin/me`
- `POST /admin/posts`
- `PATCH /admin/posts/:id`
- `DELETE /admin/posts/:id`
- `POST /admin/explore-cards`
- `PATCH /admin/explore-cards/:id`
- `DELETE /admin/explore-cards/:id`
- `POST /admin/ads`
- `PATCH /admin/ads/:id`
- `DELETE /admin/ads/:id`
- `POST /admin/media/upload`
- `DELETE /admin/media/:id`
