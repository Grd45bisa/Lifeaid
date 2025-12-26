# Lighthouse CI Guide

## Quick Start

### Run Locally
```bash
npm run lighthouse
```

### Install Lighthouse CLI (one-time)
```bash
npm install -g @lhci/cli
```

---

## GitHub Actions Workflow

**File:** `.github/workflows/lighthouse.yml`

**Triggers:**
- Every push to `main`/`master`
- Every Pull Request

**Actions:**
1. Builds production bundle
2. Runs Lighthouse 3x
3. Fails if score < 90
4. Posts results as PR comment

---

## Score Thresholds

| Category | Minimum | Status |
|----------|---------|--------|
| Performance | 90 | 🔴 Fail if below |
| Accessibility | 90 | 🔴 Fail if below |
| Best Practices | 90 | 🔴 Fail if below |
| SEO | 90 | 🔴 Fail if below |

---

## Core Web Vitals Budgets

| Metric | Budget | Notes |
|--------|--------|-------|
| FCP | 1.8s | First Contentful Paint |
| LCP | 2.5s | Largest Contentful Paint |
| CLS | 0.1 | Cumulative Layout Shift |
| TBT | 200ms | Total Blocking Time |

---

## Local Testing

```bash
# Build and preview
npm run build
npm run preview

# In another terminal, run Lighthouse
npx lighthouse http://localhost:4173 --view
```

---

## Monitoring (Optional)

### Google Analytics Core Web Vitals
Add to your app:
```tsx
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

### Sentry Error Tracking
```bash
npm install @sentry/react
```
