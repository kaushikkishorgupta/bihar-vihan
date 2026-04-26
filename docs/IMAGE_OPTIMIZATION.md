# Image Optimization Setup

## What is added

- Script: `scripts/optimize-images.sh`
- Optimized output folder: `assets/img/optimized/`
- PWA icons: `assets/icons/icon-192.png`, `assets/icons/icon-512.png`
- Favicon files:
  - `assets/icons/favicon-32.png`
  - `assets/icons/apple-touch-icon.png`

## How to run

```bash
bash scripts/optimize-images.sh
```

Optional custom paths:

```bash
bash scripts/optimize-images.sh ./assets/img ./assets/img/optimized
```

## Best practice targets

- Hero images: <= 250 KB (WebP preferred)
- Content images: <= 150 KB
- Thumbnails/cards: <= 80 KB
- Always use:
  - `loading="lazy"` (except first visible hero image)
  - explicit `width` and `height`
  - meaningful `alt` text
