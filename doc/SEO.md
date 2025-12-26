# SEO Best Practices Guide

## Quick Reference

| Feature | Status | File |
|---------|--------|------|
| react-helmet-async | ✅ | `main.tsx`, `SEO.tsx` |
| Sitemap | ✅ | `public/sitemap.xml` |
| Robots.txt | ✅ | `public/robots.txt` |
| JSON-LD | ✅ | `SEO.tsx` |
| Open Graph | ✅ | `SEO.tsx` |
| Canonical URLs | ✅ | `SEO.tsx` |

---

## SEO Component Usage

```tsx
import SEO from '../Components/SEO';

// Homepage
<SEO
  title="Home"
  description="Your homepage description"
  type="website"
/>

// Product Page
<SEO
  title="Electric Patient Lifter"
  description="Professional patient lifting equipment"
  type="product"
  price="15000000"
  currency="IDR"
  image="/Product.webp"
/>

// Article/Blog
<SEO
  title="Patient Care Guide"
  description="How to care for elderly patients"
  type="article"
  publishedTime="2025-01-15"
  author="LifeAid Team"
/>
```

---

## JSON-LD Structured Data

Automatically generated for:
- **Organization** - Company info, contact, social links
- **Product** - Name, price, availability

Test at: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Testing Tools

| Tool | Purpose |
|------|---------|
| [Lighthouse](chrome://flags/#enable-desktop-pwas) | Overall SEO audit |
| [Google Search Console](https://search.google.com/search-console) | Indexing status |
| [Rich Results Test](https://search.google.com/test/rich-results) | Structured data |
| [Facebook Debugger](https://developers.facebook.com/tools/debug/) | Open Graph |
| [Twitter Card Validator](https://cards-dev.twitter.com/validator) | Twitter preview |

---

## Sitemap

Located at `public/sitemap.xml`. Includes:
- Multilingual pages (ID/EN)
- Image sitemaps
- hreflang alternates

---

## Canonical URLs

Automatically set based on current URL. Override with:
```tsx
<SEO canonical="https://lifeaidstore.com/product/exact-url" />
```
