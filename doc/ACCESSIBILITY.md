# Accessibility (A11y) Guide

## Quick Reference

### Component Checklist

| Component | Key Requirements |
|-----------|-----------------|
| **Buttons** | `aria-label` for icon-only, visible focus, disabled state |
| **Inputs** | `<label>` with `htmlFor`, `aria-invalid` + `aria-describedby` for errors |
| **Links** | Descriptive text (not "click here"), `href` required |
| **Images** | `alt` text (empty `alt=""` for decorative) |
| **Modals** | Focus trap, `role="dialog"`, `aria-modal="true"`, Escape closes |
| **Navigation** | Skip link, `<nav>` element, `aria-current="page"` |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` | Activate buttons/links |
| `Space` | Activate buttons, toggle checkboxes |
| `Escape` | Close modals/dropdowns |
| `Arrow Keys` | Navigate within menus/tabs |

---

## ESLint Rules Enabled

See `eslint.config.js` for full list. Key rules:
- `jsx-a11y/alt-text` - Images must have alt text
- `jsx-a11y/anchor-is-valid` - Links must be valid
- `jsx-a11y/label-has-associated-control` - Inputs need labels
- `jsx-a11y/no-static-element-interactions` - Divs shouldn't have click handlers

Run: `npm run lint`

---

## Testing Tools

### Browser DevTools
- **Chrome Lighthouse**: Audits > Accessibility
- **Firefox**: Accessibility panel in DevTools

### Recommended Extensions
- **axe DevTools** - Automated accessibility testing
- **WAVE** - Visual accessibility feedback

### Keyboard Testing
1. Press `Tab` through entire page
2. Verify all interactive elements are reachable
3. Verify focus is visible (outline/ring)
4. Test forms with keyboard only

---

## Pre-built Accessible Components

| Component | Path | Features |
|-----------|------|----------|
| `AccessibleButton` | `ui/AccessibleButton.tsx` | Loading state, icons, focus ring |
| `AccessibleInput` | `ui/AccessibleInput.tsx` | Label, error, helper text |
| `AccessibleModal` | `ui/AccessibleModal.tsx` | Focus trap, Escape key |
| `SkipLink` | `ui/SkipLink.tsx` | Skip to content |

### Usage Example

```tsx
import SkipLink from './Components/ui/SkipLink';
import AccessibleButton from './Components/ui/AccessibleButton';

function App() {
  return (
    <>
      <SkipLink targetId="main-content" />
      <nav>...</nav>
      <main id="main-content" tabIndex={-1}>
        <AccessibleButton variant="primary">
          Click Me
        </AccessibleButton>
      </main>
    </>
  );
}
```

---

## Common Fixes

### Missing alt text
```tsx
// ❌ Bad
<img src="/photo.jpg" />

// ✅ Good
<img src="/photo.jpg" alt="Team photo at office" />

// ✅ Decorative (empty alt)
<img src="/decoration.svg" alt="" />
```

### Clickable divs
```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### Missing form labels
```tsx
// ❌ Bad
<input type="email" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```
