# Bihar Vihaan - Audit and Upgrade Roadmap

## Phase 1 (Critical)
- Fix XSS surfaces in dynamic rendering (`script.js`, `admin.html`)
- Replace placeholder SEO canonicals and add structured metadata
- Add `robots.txt`, `sitemap.xml`, security headers template (`_headers`)
- Add contact and trip form validation
- Add PWA shell (`manifest.webmanifest`, `sw.js`)

## Phase 2 (Platform)
- Firebase integration for admin auth + CRUD + storage (`admin-firebase.js`)
- Firestore and Storage rules enforcement (`firestore.rules`, `storage.rules`)
- Admin role control via `admin_users/{uid}`

## Phase 3 (Monetization)
- Ad slots in homepage/blog sections
- AdSense loader placeholder
- Affiliate link pattern with `rel="sponsored nofollow"`
- Click tracking hooks via `localStorage` (replace with analytics later)

## Phase 4 (Scale)
- Move from static file blog urls to slug routing
- Add district pages and long-tail SEO clusters
- Connect forms to backend email workflow
- Add map-based filters + itinerary persistence
- Add FCM push notifications with topic segmentation
