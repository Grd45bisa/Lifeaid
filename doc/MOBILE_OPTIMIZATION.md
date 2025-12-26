# Mobile Optimization Guide

## Touch Targets

**Minimum Size: 48x48px** (WCAG 2.5.5)

```css
/* Already added to index.css */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
}
```

---

## Responsive Typography

| Breakpoint | Base Font |
|------------|-----------|
| Desktop | 16px |
| Mobile (<640px) | 14px |

Already configured in `index.css`.

---

## Testing Devices

### Chrome DevTools
1. Press `F12` → Device Toolbar (Ctrl+Shift+M)
2. Select device: iPhone 12 Pro, Pixel 5, etc.
3. Run Lighthouse in "Mobile" mode

### Real Device Testing
- BrowserStack: [browserstack.com](https://browserstack.com)
- Connect Android: `chrome://inspect`
- iOS: Safari Web Inspector

---

## Service Worker

**Purpose:** Offline support, faster load times

| File | Description |
|------|-------------|
| `public/sw.js` | Service Worker script |
| `src/main.tsx` | Registration (production only) |

**Caches:**
- `/index.html`
- `/Logo-trans.webp`
- `/Hero.webp`
- `/Product.webp`

---

## Reducded Motion

Respects `prefers-reduced-motion` media query:
- Disables animations
- Instant transitions

---

## JavaScript Optimization

Already configured in `vite.config.ts`:
- Code splitting (vendor chunks)
- Tree shaking
- Console removal in production
- Gzip/Brotli compression
