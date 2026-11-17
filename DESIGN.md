# LabTrack - Design System & Visual Architecture

## 1. Product Domain & Use Scene
- **Domain:** Bromatological & Water Quality Laboratory Operations (CAA Art. 982 Compliance, In-Situ Sampling Chain-of-Custody, Biological SLA < 24h, Forensic SHA-256 Protocols, External ICP-MS Referrals).
- **Mode:** **Operate** (precision analytical workstation & field sampling tool).
- **Use Scene:** Used both on desktop monitors in dark/controlled microbiology & analytical benches and on mobile devices/tablets in industrial water plants and food-processing facilities.
- **Dial:** `ENERGY 2 / RHYTHM 4 / MOTION 2` - Calm, disciplined, high-legibility clinical-instrumental interface. Zero visual noise, zero decorative glow halos, zero perpetual animations.

## 2. Competitive Benchmarking
Benchmarked against enterprise laboratory information management systems (LIMS) and environmental field custody software (**LabWare LIMS**, **Benchling**, **QBench**):
- **Single-Theme Justification:** Fixed dark-instrumental bench palette (`#0a0e17` base, `#111827` elevated surface) minimizes glare in laboratory environments and creates crisp figure-ground contrast for numeric determinations and SLA thresholds, paired with an explicit high-contrast light `@media print` stylesheet (white paper, dark ink) for printable official analytical certificates.
- **No `darkMode: 'class'` toggle:** Intentionally omitted in favor of a single calibrated bench theme + print mode.

## 3. Color Tokens (Consolidated Palette)
Strictly limited to neutral surfaces, **1 primary interactive accent**, and **3 semantic status colors**:

| Role | Token / Hex | Tailwind Class | Usage & Contrast |
| :--- | :--- | :--- | :--- |
| Canvas Base | `#0a0e17` | `bg-[#0a0e17]` | Root application background |
| Header / Subtle Well | `#0d1322` | `bg-[#0d1322]` | Header bar, table headers, flat inner sub-regions |
| Card Surface | `#111827` | `bg-[#111827]` | Primary data cards, modals, panels |
| Hairline Border | `#1e293b` / `#334155` | `border-slate-800` / `border-slate-700` | Structural borders & horizontal dividers |
| Text Primary | `#f8fafc` | `text-slate-50` / `text-white` | Headings, values, active controls |
| Text Secondary | `#cbd5e1` | `text-slate-300` | Body copy, descriptions (>= 10:1) |
| Text Muted (AA Safe) | `#94a3b8` | `text-slate-400` | Labels, metadata, footer (>= 5.7:1 on `#111827`) |
| Primary Accent | `#2563eb` / `#60a5fa` | `bg-blue-600` / `text-blue-400` | Primary CTAs, active navigation, focus rings (`#60a5fa`) |
| Status: Optimal / Apta | `#047857` / `#34d399` | `bg-emerald-500/15 text-emerald-300 border-emerald-500/40` | CAA Apta, viable SLA, verified SHA-256 seals |
| Status: Warning / SLA | `#f59e0b` / `#fcd34d` | `bg-amber-500/15 text-amber-300 border-amber-500/40` | SLA attention (>16h), physicochemical non-conformity, `[DEMO]` tags |
| Status: Critical / Invalid | `#f43f5e` / `#fda4af` | `bg-rose-500/15 text-rose-300 border-rose-500/40` | Bacteriological contamination, expired SLA, tampered seal |

> **Accessibility Rule:** Never use `text-slate-500` (`#64748b`) on dark surfaces (`#0a0e17` or `#111827`), as it falls below WCAG AA 4.5:1. All functional UI text must be `>= 12px` (`text-xs`).

## 4. Typography Scale
- **UI Sans Stack:** `system-ui, -apple-system, 'Segoe UI', sans-serif` (zero-dependency offline reliability).
- **Monospace Data Stack:** `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` with `font-variant-numeric: tabular-nums` strictly for sample IDs, seal numbers, concentrations, temperatures, and SHA-256 digests.
- **Descending Heading Hierarchy (`>= 1.25x` ratio):**
  - `h1` (Brand / App Title): `1.625rem` (26px), `font-bold`, `-0.025em` tracking
  - `h2` (View Heading): `1.25rem` (20px), `font-bold`, `-0.02em` tracking
  - `h3` (Card / Modal Heading): `1.05rem` (16.8px), `font-semibold`
  - `body`: `0.875rem` (14px)
  - `text-xs` (Labels, table cells, metadata): `0.75rem` (12px) minimum

## 5. Layout, Surface & Interaction Patterns
- **Flat Card Hierarchy:** No nested bordered boxes inside cards. Separate internal sections with `border-t border-slate-800 pt-3` or borderless tonal wells (`bg-[#0d1322]`).
- **Elevation:** Neutral border definition (`border border-slate-800`) without colored neon glow halos (`shadow-blue-600/30` forbidden) and without decorative `backdrop-blur`.
- **Icons:** Uniform `1.75px` stroke inline `<svg aria-hidden="true">` icons. Zero decorative Unicode emojis in headings, tabs, buttons, or status pills.
- **Copy:** Zero em-dashes (`—`). Clear operational Spanish terminology. Seeded records carry explicit `[DEMO]` tags and a user-accessible demo purge flow.
- **Accessibility & Touch:**
  - Every interactive target enforces `min-h-[44px]` (`min-w-[44px]` for icon buttons).
  - Keyboard-only `:focus-visible` ring (`2px solid #60a5fa`, `2px` offset).
  - ARIA `role="tablist"` / `role="tab"` / `aria-selected` with roving arrow-key navigation and `role="tabpanel"`.
  - Accessible dialogs (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `Escape` dismissal, backdrop click dismissal, focus restoration, background `inert`).
  - `@media (prefers-reduced-motion: reduce)` suppresses transitions and animations.
