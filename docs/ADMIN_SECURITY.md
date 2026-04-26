# Admin Security Setup (PHP)

## Added protection

- Server-side login gate for `admin.php`
- CSRF protection on login form
- Session timeout (30 min idle)
- Failed login rate limit (5 attempts / 15 min)
- Secure session cookie flags (`HttpOnly`, `SameSite=Strict`, `Secure` on HTTPS)
- `admin-auth.php` and `page-loader.php` denied via `.htaccess`

## Files

- `admin-auth.php`
- `admin-login.php`
- `admin-logout.php`
- `admin.php`
- `.htaccess`

## Production credentials

Set environment variables on server:

- `BV_ADMIN_USER`
- `BV_ADMIN_PASS_HASH` (recommended)

Optional local fallback:

- `BV_ADMIN_PASS`

## Generate password hash

Run on any PHP-enabled machine:

```php
<?php echo password_hash('YourStrongPasswordHere', PASSWORD_DEFAULT), PHP_EOL;
```

Copy output into `BV_ADMIN_PASS_HASH`.
