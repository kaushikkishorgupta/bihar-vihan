# Recommended Folder Structure

This structure is compatible with your current HTML/PHP setup and future backend work:

```text
/
  assets/
    css/
    js/
    img/
      optimized/
    icons/
  pages/
    blog/
    destinations/
    legal/
  scripts/
    optimize-images.sh
  docs/
    FOLDER_STRUCTURE.md
    IMAGE_OPTIMIZATION.md
  index.php
  page-loader.php
  .htaccess
```

## Migration Plan (Safe, Non-Breaking)

1. Keep current files in root while traffic is live.
2. Move copied files gradually into `assets/` and `pages/`.
3. Update links one section at a time.
4. Validate each page after each move.
5. Remove old root duplicates only after full verification.
