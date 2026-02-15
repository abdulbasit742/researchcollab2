

# Three-in-One: Fix Crash + Sitemap + Dark Mode Audit

## URGENT: Fix App Crash (Blocking)

The app currently shows a **blank white screen** due to a `TypeError: Cannot read properties of null (reading 'useRef')` in `TooltipProvider`. This is caused by duplicate React instances in the bundle. This must be fixed before any other work can proceed.

**Fix:** Add `resolve.dedupe` to `vite.config.ts`:
```
resolve: {
  dedupe: ["react", "react-dom", "react/jsx-runtime"],
  alias: { "@": ... }
}
```

---

## Task 1: End-to-End Verification

After the crash fix, visually verify:
- Landing page loads correctly with all sections
- Lazy-loaded routes work (navigate to `/pricing`, `/about`, `/tools`)
- No console errors on page transitions

---

## Task 2: Add sitemap.xml

Create a static `public/sitemap.xml` listing all public-facing routes. Private routes (admin, dashboard, messages, settings, workroom) are excluded since they're already blocked by `robots.txt`.

**Public routes to include** (~45 URLs):
- `/` (landing)
- `/auth`, `/forgot-password`
- `/tools`, `/pricing`, `/about`, `/contact`, `/blog`, `/earn`
- `/features`, `/careers`, `/press`, `/help`, `/docs`
- `/privacy`, `/terms`, `/cookies`
- `/collaborations`, `/grants`, `/matches`, `/smart-matching`
- `/fyp-services`, `/offers`, `/events`, `/learning`
- `/governance`, `/governance/constitution`, `/governance/decisions`
- `/rankings/global`, `/research-papers`
- `/institution/apply`, `/institutions/rankings`
- `/install`, `/search`
- And other publicly accessible pages

Each URL will include `<lastmod>` (today's date), `<changefreq>`, and `<priority>` values.

---

## Task 3: Dark Mode Audit

The app uses `next-themes` with a `ThemeToggle` component in the navbar. CSS variables for dark mode are already defined in `src/index.css`. After the crash is fixed, I will:

1. Toggle dark mode on the landing page and screenshot key sections
2. Check for contrast issues (text on backgrounds, borders, cards)
3. Fix any components using hardcoded colors instead of CSS variables
4. Verify gradient utilities (`gradient-hero`, `gradient-card`, `text-gradient`) adapt properly in dark mode

---

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Add `resolve.dedupe` to fix React crash |
| `public/sitemap.xml` | New file with all public routes |
| Various components (if needed) | Fix dark mode contrast issues found during audit |

## Estimated Scope
- Crash fix: 1 line change
- Sitemap: 1 new file
- Dark mode fixes: depends on audit findings (0-5 files)

