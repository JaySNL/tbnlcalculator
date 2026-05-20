# TBNL Battery Sizing Calculator

Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Recharts + next-intl

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — eslint
- `npx tsc --noEmit` — type check

## Architecture
- `src/lib/simulation/` — pure TypeScript simulation engine (no React)
- `src/components/calculator/` — UI components
- `src/i18n/` — bilingual NL/EN with next-intl
- All calculation runs client-side, no API routes

## Conventions
- shadcn/ui design tokens: `text-foreground`, `bg-muted`, `border-border`
- No emoji icons in UI. No gratuitous gradients. Max `font-semibold`.
- Selected state: `bg-foreground text-background` (inverted monochrome)
- Locale routing via next-intl middleware (`/nl`, `/en`)
