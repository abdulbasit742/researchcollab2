

# Dark Mode Support

Add a system-wide dark mode toggle with theme persistence, smooth transitions, and proper theming across all pages.

## What You Get

- A theme toggle button in the navbar (sun/moon icon)
- Dark mode that applies consistently across every page
- User preference saved so it persists between sessions
- Respects system preference (auto-detect light/dark OS setting)
- Smooth color transitions when switching themes

## Technical Approach

1. **Configure `next-themes` provider** (already installed) in `App.tsx` wrapping the app with `ThemeProvider` using `attribute="class"` and `defaultTheme="system"`

2. **Add theme toggle to Navbar** - A sun/moon icon button in the desktop actions area and mobile menu that cycles between light, dark, and system themes

3. **Update `tailwind.config.ts`** - Set `darkMode: "class"` to enable class-based dark mode switching

4. **Create a `ThemeToggle` component** - Reusable button component using `useTheme()` from `next-themes` with animated sun/moon icons

5. **Audit and fix dark mode colors** - Review key pages (Home, Pricing, Research, Deals, Profile) to ensure `bg-background`, `text-foreground`, and other semantic Tailwind classes work correctly in dark mode. Fix any hardcoded colors that break in dark theme.

## Files to Create/Modify

- `src/components/ui/theme-toggle.tsx` - New toggle component
- `src/App.tsx` - Wrap with ThemeProvider
- `tailwind.config.ts` - Add `darkMode: "class"`
- `src/components/layout/Navbar.tsx` - Add toggle button
- `src/index.css` - Ensure dark mode CSS variables are properly defined

