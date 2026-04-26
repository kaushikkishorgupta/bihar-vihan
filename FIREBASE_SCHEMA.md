# Firebase Data Schema

## Collections

- `admin_users/{uid}`
  - `email` string
  - `active` boolean
  - `role` string (`admin`)
  - `created_at` timestamp
  - `updated_at` timestamp

- `blog_posts/{id}`
  - `title` string
  - `category` string
  - `excerpt` string
  - `image` string (https url)
  - `url` string
  - `tags` array<string>
  - `created_by` uid
  - `created_at` timestamp
  - `updated_at` timestamp

- `explore_cards/{id}`
  - `title` string
  - `category` string
  - `image` string (https url)
  - `created_by` uid
  - `created_at` timestamp
  - `updated_at` timestamp

- `ads_campaigns/{id}`
  - `title` string
  - `placement` string
  - `target_url` string
  - `budget` string
  - `created_by` uid
  - `created_at` timestamp
  - `updated_at` timestamp

- `media_items/{id}`
  - `title` string
  - `category` string
  - `file_name` string
  - `url` string
  - `created_by` uid
  - `created_at` timestamp
  - `updated_at` timestamp

## Storage

- Bucket path: `media/*`
  - image/video uploads for blog/media gallery/admin
