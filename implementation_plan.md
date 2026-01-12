# Theme System Refactor (Tailwind v4 Native)

Objective: Fix persistent light/dark mode issues by moving logic from React/JSX to native CSS variables, ensuring zero-latency switching and correct Tailwind v4 compat.

## 1. `globals.css` - Single Source of Truth
We will define the background *images* and *colors* entirely in CSS variables.

```css
@import "tailwindcss";

@layer base {
  :root {
    /* Colors */
    --background: 0 0% 100%;
    /* ... other colors ... */

    /* Dynamic Backgrounds (Light Mode = Paper) */
    --bg-image-base: url("data:image/svg+xml,..."); /* Noise */
    --bg-color-base: #FDFBF7;
    --bg-overlay: radial-gradient(circle at center, transparent 0%, rgba(200,180,150,0.15) 100%);
  }

  .dark {
    /* Colors */
    --background: 240 10% 3.9%;
    /* ... other colors ... */
    
    /* Dynamic Backgrounds (Dark Mode = Stars) */
    --bg-image-base: radial-gradient(1px 1px at 10% 10%, rgba(255,255,255,0.8) 1px, transparent 0), ...; /* Stars */
    --bg-color-base: #09090b; /* Zinc 950 */
    --bg-overlay: none;
  }

  body {
    background-color: var(--bg-color-base);
    background-image: var(--bg-image-base), var(--bg-overlay);
    background-attachment: fixed;
    /* transition: background 0.5s ease; -> Smooth switching */
  }
}
```

## 2. `tailwind.config.ts`
Ensure strict v4 cleanup.

## 3. `page.tsx`
Remove all:
- `<div className="fixed ... dark:hidden" />`
- `<div className="fixed ... hidden dark:block" />`

The page will just be:
```tsx
<div className="min-h-screen ...">
  {/* Content */}
</div>
```
This guarantees that whatever class is on `<html>`, the CSS picks it up immediately. No React render cycle needed for background.
