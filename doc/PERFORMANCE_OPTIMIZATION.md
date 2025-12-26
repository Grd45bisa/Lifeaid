# Performance Optimization Guide

Dokumentasi untuk optimasi Vite dan mencapai Lighthouse score 100.

---

## 📦 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Build + analyze bundle
npm run build:analyze
# Kemudian buka file stats.html di browser

# Preview production build
npm run preview

# Lihat ukuran bundle
npm run size
```

---

## 🎯 Code Splitting Strategy

| Chunk | Contents | Purpose |
|-------|----------|---------|
| `vendor-react` | React, ReactDOM, Scheduler | Core framework - rarely changes |
| `vendor-router` | React Router | Routing - separate for caching |
| `vendor-supabase` | Supabase client | Backend SDK |
| `vendor-emailjs` | EmailJS | Email service |
| `vendor` | Other node_modules | Miscellaneous deps |
| `utils` | `/src/utils/*` | Shared utilities |
| `admin` | `/src/Components/Admin/*` | Admin panel (lazy load) |
| `components-large` | WhatsApp, SmartCare | Large components |

---

## ⚡ Lighthouse Tips

### 1. Lazy Loading with Preload

```tsx
import { lazyWithPreload } from '@utils/lazyWithPreload';
import { SafeSuspense } from '@components/ui/ErrorBoundary';
import LoadingFallback from '@components/ui/LoadingFallback';

// Define lazy component with preload capability
const AdminPanel = lazyWithPreload(() => import('./AdminPanel'));

function App() {
  return (
    <SafeSuspense fallback={<LoadingFallback variant="fullscreen" />}>
      <AdminPanel />
    </SafeSuspense>
  );
}

// Preload on link hover (React Router)
<Link to="/admin" onMouseEnter={() => AdminPanel.preload()}>
  Admin
</Link>
```

### Best Practices: Kapan Pakai Lazy Loading

| ✅ Gunakan Lazy Loading | ❌ Jangan Lazy Load |
|-------------------------|---------------------|
| Routes/pages | Navbar, Footer |
| Modals, dialogs | Above-the-fold content |
| Admin features | Critical UI elements |
| Heavy components | Small utilities |
| Conditional features | Frequently used components |

### 2. Image Optimization with OptimizedImage

```tsx
import OptimizedImage from '@components/ui/OptimizedImage';

// Hero image (above the fold - priority loading)
<OptimizedImage
  src="/Hero.webp"
  alt="Hero Banner"
  priority
  width={1200}
  height={600}
  placeholder="#1a1a2e"
/>

// Gallery images (lazy loaded with blur)
<OptimizedImage
  src="/product.webp"
  alt="Product"
  aspectRatio="4/3"
  placeholder="#f0f0f0"
/>

// Multiple formats with fallback
<OptimizedImage
  src="/image.jpg"
  sources={[
    { src: '/image.avif', type: 'image/avif' },
    { src: '/image.webp', type: 'image/webp' },
  ]}
  alt="Optimized Image"
/>

// Responsive srcSet
<OptimizedImage
  src="/hero.webp"
  srcSet="/hero-640.webp 640w, /hero-1280.webp 1280w, /hero-1920.webp 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 1920px"
  alt="Responsive Hero"
/>
```

### Image Format Guidelines

| Use Case | Format | Loading | Priority |
|----------|--------|---------|----------|
| Hero/LCP | WebP/AVIF | `eager` | `fetchpriority="high"` |
| Gallery | WebP | `lazy` | Default |
| Icons | SVG | `eager` | Default |
| Background | WebP (CSS) | N/A | Default |

### Tools untuk Compress Gambar

1. **[Squoosh](https://squoosh.app/)** - Web-based, best quality
2. **[TinyPNG](https://tinypng.com/)** - Batch processing
3. **Sharp** (sudah terinstall) - Programmatic:
   ```bash
   npx sharp -i input.png -o output.webp --format webp -q 80
   ```
4. **ImageMagick** - CLI:
   ```bash
   convert input.png -quality 80 output.webp
   ```

### 3. Font Optimization

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />

<!-- Font display swap -->
<style>
  @font-face {
    font-family: 'MainFont';
    src: url('/fonts/main.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

### 4. Critical CSS

Inline critical CSS di `index.html`:

```html
<head>
  <style>
    /* Critical CSS untuk above-the-fold content */
    body { margin: 0; font-family: system-ui; }
    .hero { min-height: 100vh; }
  </style>
</head>
```

---

## 📊 Analyzing Bundle Size

### Method 1: Stats HTML

```bash
npm run build:analyze
# Buka stats.html di browser
```

Treemap view menunjukkan:
- Ukuran setiap module
- Gzip/Brotli compressed size
- Dependencies yang besar

### Method 2: Terminal

```bash
npm run size
```

### Method 3: Manual Check

```powershell
# PowerShell - lihat semua file di dist
Get-ChildItem dist/assets -Recurse | 
  Select-Object Name, @{N="Size(KB)";E={"{0:N2}" -f ($_.Length/1KB)}} |
  Sort-Object "Size(KB)" -Descending
```

---

## 🔧 Production Checklist

- [ ] `npm run build` tanpa error
- [ ] Bundle size < 500KB per chunk
- [ ] File `.gz` dan `.br` ada di `dist/assets`
- [ ] `npm run preview` berjalan normal
- [ ] Lighthouse Performance > 90
- [ ] No console.log in production

---

## 🚀 Server Configuration

Untuk kompresi bekerja, server harus dikonfigurasi:

### Nginx

```nginx
gzip on;
gzip_types text/plain text/css application/javascript;

# Brotli (jika module tersedia)
brotli on;
brotli_types text/plain text/css application/javascript;
```

### Netlify

Otomatis support gzip & brotli.

### Vercel

Otomatis support gzip & brotli.
