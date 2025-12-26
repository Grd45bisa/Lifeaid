# Security Configuration Guide

## Quick Reference

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS, data injection attacks |
| `Strict-Transport-Security` | Enforces HTTPS |
| `X-Content-Type-Options` | Prevents MIME type sniffing |
| `X-Frame-Options` | Prevents clickjacking |
| `Referrer-Policy` | Controls referrer info leakage |
| `Permissions-Policy` | Restricts browser features |

---

## Files Created

| File | Platform | Description |
|------|----------|-------------|
| `vite.config.ts` | Development | Dev server security headers |
| `public/_headers` | Netlify | Production security headers |
| `vercel.json` | Vercel | Alternative hosting config |

---

## Testing Security Headers

### 1. Check Headers Locally
```bash
npm run dev
curl -I http://localhost:5200
```

### 2. Online Tools (After Deploy)
- [securityheaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- Chrome DevTools > Network > Headers

---

## CSP Notes for Vite/React

The CSP includes `'unsafe-inline'` because:
- Vite injects styles at runtime
- React may use inline style attributes

For stricter CSP in production, use:
- CSS modules instead of inline styles
- Nonce-based script loading

---

## HTTPS for Development (Optional)

### Generate Self-Signed Certificate
```bash
# Using mkcert (recommended)
brew install mkcert  # macOS
mkcert -install
mkcert localhost

# Then update vite.config.ts:
# server: {
#   https: {
#     key: './localhost-key.pem',
#     cert: './localhost.pem'
#   }
# }
```

---

## Troubleshooting

### Mixed Content Errors
Ensure all resources (images, scripts, APIs) use HTTPS.

### CSP Violations
Check browser console for blocked resources, add to CSP whitelist.

### Supabase Connection
CSP allows: `https://*.supabase.co` and `wss://*.supabase.co`
