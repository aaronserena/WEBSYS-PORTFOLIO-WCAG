# Accessible Personal Portfolio (MVP)

A responsive, WCAG-focused personal portfolio built with plain **HTML5**, **CSS3**, and **vanilla JavaScript**. No frameworks, no build step, no dependencies.

## Structure

```text
portfolio/
├── index.html          # Single-page portfolio (all sections)
├── css/style.css       # Design tokens, layout, responsive rules
├── js/script.js        # Mobile nav, active section, form validation
├── assets/images/      # SVG profile + project images
└── README.md
```

## Run locally

```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works (VS Code Live Server, `npx serve`, etc.).

## Light / dark mode

- Toggle button in the header switches between light and dark themes.
- The choice is saved in `localStorage` (`portfolio-theme`) and restored on the next visit.
- If the visitor has not chosen explicitly, the site follows the OS `prefers-color-scheme` setting and updates live when it changes.
- The saved theme is applied by a small inline script in `<head>` *before* first paint to avoid a flash.
- Without JavaScript the toggle is hidden and the OS setting is used via a CSS media query.

Dark palette: `css/style.css` — `:root[data-theme="dark"]` and the `@media (prefers-color-scheme: dark)` block.

## Sections

Home · About Me · Skills · Projects · Contact · Footer

## Swap in your own content

All content is placeholder ("Alex Rivera"). Replace:

| What | Where |
| --- | --- |
| Name | `index.html`: `.brand`, `#hero-title`, footer copyright, `<title>` |
| Role & intro | `.hero-role`, `.hero-intro` |
| Bio / education / interests | `#about` section |
| Skills | `#skills` lists |
| Projects | `#projects` `<article>` cards + images in `assets/images/` |
| Email / social links | `#contact` `.contact-list` |
| Colors | `css/style.css` `:root` custom properties |

Profile and project images are lightweight local SVGs — replace `src` with your own photos and update the `alt` text to describe the new image.

## Accessibility implementation

### Perceivable
- Meaningful `alt` on every image (`alt="Portrait of Alex Rivera"`); no decorative images are used.
- All body text ≥ 16px with `line-height: 1.65`; muted text is `#4a5568` (≈7.5:1 on white), accent links/buttons candy purple `#9333ea` (≈5.4:1), errors `#a4262c` (≈7.3:1) — all exceed WCAG AA 4.5:1.
- Non-text contrast (SC 1.4.11): control borders `#6f7b8c` (≈4.3:1), focus outline `#b45309` (≈5.0:1), button borders (≈5.4:1) — all exceed 3:1 in light mode. In dark mode the same rules pass: links `#c084fc` (≈6.9:1 on bg), focus outline `#f0b429` (≈9.8:1), control borders `#8b95a6` (≈6.0:1).
- Fluid `clamp()` type; images sized with `width`/`height` + `aspect-ratio` (no layout shift).
- Mobile-first responsive layout with no horizontal scrolling down to 320px.

### Operable
- **Skip link** as the first focusable element ("Skip to main content").
- Visible `:focus-visible` outline (3px solid, 3px offset) on every interactive element — never removed.
- Real `<a>` links for navigation, real `<button>` for actions; no clickable `<div>`s.
- Mobile menu: `aria-expanded` / `aria-controls`, closes on `Escape` (focus returns to the toggle), on link selection, and on outside click. No keyboard trap.
- Touch targets ≥ 44×44px for nav links, buttons, and footer links.
- `prefers-reduced-motion: reduce` disables smooth scrolling and transitions.

### Understandable
- `lang="en"`, descriptive `<title>`, meta description.
- Theme toggle is a real `<button>` with a descriptive accessible name that names the action ("Switch to dark/light mode") — icons alone are never the only indicator.
- Simple nav labels: Home, About, Skills, Projects, Contact.
- Consistent layout; clear headings; descriptive link text ("View Project: ClassWave", never "Click here").
- Form: `<label for>` on every field, correct `type`/`autocomplete`, visible "(required)" markers (text, not color), field hints via `aria-describedby`, specific messages ("Please enter a valid email address, for example name@example.com."), `role="alert"` errors, `role="status"` success message, focus moved to the first invalid field.

### Robust
- Semantic landmarks: `<header>`, `<nav aria-label>`, `<main>`, `<section aria-labelledby>`, `<article>`, `<footer>`.
- No skipped heading levels: `h1` → `h2` per section → `h3` per block → `h4` where needed.
- ARIA only where native HTML is not enough (menu toggle, live messages, `aria-current`).
- Works without JavaScript: navigation, links, and content remain fully usable.
- Valid, framework-free markup that runs in Chrome, Safari, Firefox, and Edge.

## Testing checklist

- **Keyboard**: Tab / Shift+Tab through skip link → nav → CTAs → form → footer. Enter activates links and the submit button, Escape closes the mobile menu.
- **Headings**: one `h1`, sequential `h2`/`h3` per section.
- **Contrast**: verify with browser dev tools or the WAVE/axe extension.
- **Responsive**: check 320px, 375px, 414px, 768px, 1024px, 1440px — no overflow.
- **Reduced motion**: enable "Reduce motion" in OS settings; scrolling and transitions become instant.
- **Screen reader**: VoiceOver (macOS: Cmd+F5) or NVDA — confirm landmarks, headings, image alt text, and form labels/errors are announced.
