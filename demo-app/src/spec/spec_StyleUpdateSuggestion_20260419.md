# Style Update Suggestion — SKILL.md Compliance Review
**Date:** 2026-04-19  
**Scope:** `demo-app` vs. `ui-ux-pro-max` SKILL.md

---

## Summary

Reviewed all source files in `demo-app/src/` against the SKILL.md rule set. Found **5 mismatches** (M1–M4, M6). One initially flagged mismatch (M5) was **resolved as inapplicable** after deeper analysis — the current code is the correct approach given the component library constraint.

---

## Mismatches

### CRITICAL Priority

#### M1. Focus States Missing on Custom Elements
- **Rule:** `focus-states` — visible focus rings on all interactive elements
- **Issue:** Custom interactive elements only define `:hover` rules, no `:focus-visible`:
  - `.att-calendar-cell`
  - `.att-modal-chip`
  - `.att-leave-row-header`
  - `.att-delete-btn`
  - `.att-modal-close`
  - `.att-modal-btn-submit`
- **Fix:** Add `:focus-visible` CSS rules mirroring the existing `:hover` styles in `styles/attendance.css`. Add a global `:focus-visible` outline reset in `styles/global.css`.

#### M2. Touch Target Size — Small Custom Elements
- **Rule:** `touch-target-size` — minimum 44×44px
- **Issue:** No explicit minimum size on:
  - `.att-modal-close` button
  - `.att-legend-item` chips (12px font, likely under 44px tall)
  - Sidebar filter chips in `AttendanceRecord`
- **Fix:** Add `min-height: 44px; min-width: 44px;` to those elements in `styles/attendance.css`.

#### M3. Text Contrast — `--color-outline-variant` Risk
- **Rule:** `color-contrast` — 4.5:1 minimum for normal text
- **Issue:** `--color-outline-variant: #adb3b5` achieves only ~3.0:1 on white backgrounds. If this token is used anywhere as a text color, it fails WCAG AA.
- **Fix:** Audit `attendance.css` for any `color: var(--color-outline-variant)` usage; replace with `--color-on-surface-variant` (#5a6062, ~5.1:1).

---

### MEDIUM Priority

#### M4. `prefers-reduced-motion` Not Implemented
- **Rule:** `reduced-motion`
- **Issue:** No `@media (prefers-reduced-motion: reduce)` block exists anywhere in the codebase. Affected animations:
  - `att-modal-fade-in` (opacity)
  - `att-modal-scale-in` (transform + opacity)
  - `att-pulse` (looping opacity on 今日 badge)
- **Fix:** Add a `@media (prefers-reduced-motion: reduce)` block to `styles/attendance.css`. Apply tiered treatment (see S2 in SKILL.md Update Suggestions below):
  - Disable `att-pulse` entirely (`animation: none`)
  - Reduce `att-modal-scale-in` to opacity-only (remove `transform` motion)

#### M5 — Sidebar `transition: flex` — ✅ RESOLVED — CURRENT CODE IS CORRECT
- **Rule:** `transform-performance` — use transform/opacity, not layout properties
- **Verdict:** Inapplicable. The project uses Ant Design's `<Sider>`, which manages collapse internally via flexbox. Overriding with `transform: translateX()` would cause visual desync (flex space stays reserved, only visual position shifts), breaking the content area layout. The framework's own transition mechanism is the correct choice here.
- **Action:** No change to `MainLayout.jsx`. See S1 in SKILL.md Update Suggestions below for a rule clarification.

#### M6. Inconsistent Styling Across Pages
- **Rule:** `consistency` — same style approach across all pages
- **Issue:** `AttendanceRecord` uses CSS custom properties + class-based styling (design token system). Other pages (`AlarmMonitor.jsx`, `EquipmentTracking.jsx`, `Passdown.jsx`) use heavy inline styles with hardcoded color values.
- **Fix:**
  1. Extract shared tokens (primary, surface, text, border colors) as CSS custom properties in `styles/global.css`
  2. Migrate inline `style={{ color: '#...' }}` / `style={{ background: '#...' }}` in the three pages to CSS classes referencing those tokens

---

## What Already Matches ✅

| Rule | Status |
|------|--------|
| No emoji icons (`no-emoji-icons`) | Uses `@ant-design/icons` SVG throughout |
| `cursor-pointer` on custom interactive elements | Defined on all clickable custom elements |
| Hover feedback (`hover-vs-tap`) | All interactive elements have visual hover states |
| Transition timing 150–300ms (`duration-timing`) | Transitions are 0.2s–0.3s |
| ARIA labels on modal + close button | `role="dialog"`, `aria-modal`, `aria-label` present |
| Keyboard Escape handling | `keydown` listener for `Escape` in modal |
| Responsive breakpoints at 640px / 1024px | Defined in `attendance.css` |
| Semantic HTML, label associations | Proper heading hierarchy, `<label>` wrapping checkboxes |
| Animation uses `transform`/`opacity` (`transform-performance`) | Modal animations use only these GPU-composited properties |

---

## Implementation Steps

### Phase 1 — Critical Accessibility (M1, M2, M3)
1. `styles/attendance.css` — Add `:focus-visible` rules mirroring `:hover` for all custom interactive elements
2. `styles/global.css` — Add global `:focus-visible` outline reset + custom element overrides
3. `styles/attendance.css` — Add `min-height: 44px; min-width: 44px;` to `.att-modal-close`, `.att-legend-item`, `.att-modal-chip`
4. `styles/attendance.css` — Audit and replace any `color: var(--color-outline-variant)` text usages

### Phase 2 — Motion (M4)
5. `styles/attendance.css` — Add `@media (prefers-reduced-motion: reduce)` block:
   - Disable `att-pulse` (`animation: none`)
   - Strip `transform` from `att-modal-scale-in`, keep `opacity` fade only
   - Set `transition-duration: 0.01ms` on all custom transitions within the block

### Phase 3 — Consistency (M6)
6. `styles/global.css` — Define global CSS custom properties for shared design tokens
7. `pages/AlarmMonitor.jsx`, `pages/EquipmentTracking.jsx`, `pages/Passdown.jsx` — Migrate inline color/spacing styles to CSS class references

---

## Verification

1. **Focus rings:** Keyboard-only Tab navigation through all interactive elements — confirm focus rings appear and are visible
2. **Touch targets:** Inspect element → check computed height/width on `.att-modal-close`, `.att-legend-item`
3. **Contrast:** Chrome DevTools Accessibility audit → zero contrast failures
4. **Reduced motion:** DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → confirm no animations play
5. **Consistency:** Visual side-by-side check across AlarmMonitor, EquipmentTracking, Passdown vs. AttendanceRecord after M6 fix

---

---

## SKILL.md Update Suggestions

### S1. Add Component Library Exception to `transform-performance`

**Affected rule (Priority 3, Performance / Priority 6, Animation):**
> `transform-performance` — Use transform/opacity, not width/height

**Problem:**
The rule assumes a custom/Tailwind context. When a project uses a component library (Ant Design, MUI, etc.) that manages layout transitions internally via flexbox or width, overriding with `transform: translateX()` causes visual desync — the flex space stays reserved while only the visual position shifts. This breaks layout rather than improving it.

**Triggered by:** Ant Design `<Sider>` collapse using `transition: flex`.

**Suggested addition to rule:**
```
⚠️ Exception — Component Library Constraints:
When using managed layout components (e.g., Ant Design <Sider>, MUI <Drawer>,
Radix <Sheet>), do NOT override their internal collapse/expand transitions with
transform. The library controls the flex/width layout; forcing transform causes
visual desync. Accept the library's built-in transition in these cases.
```

---

### S2. Expand `reduced-motion` Rule with Tiered Guidance

**Affected rule (Priority 3, Performance):**
> `reduced-motion` — Check prefers-reduced-motion

**Problem:**
The rule is too terse. Developers interpret it as "disable all animations" when the intent should be "disable non-essential motion, reduce functional transitions." A blanket `animation: none` on a modal entrance removes important context for users; removing only the `transform` component (keeping `opacity` fade) preserves context without vestibular motion.

**Triggered by:** `att-pulse` (decorative looping) vs. `att-modal-scale-in` (functional entrance).

**Suggested expanded rule:**
```
@media (prefers-reduced-motion: reduce) {
  /* 1. Decorative / looping animations → disable entirely */
  /*    (pulsing badges, parallax, background loops)       */
  .decorative { animation: none; }

  /* 2. Functional entrance animations → reduce to opacity only */
  /*    (modals, toasts, drawers — remove transform motion)     */
  .modal-enter { animation: fade-in 0.15s ease; } /* no scale/translate */

  /* 3. State transitions (hover color, focus ring) → keep as-is */
  /*    These are non-vestibular and provide necessary feedback   */
}
```

Tiered approach:
- **Decorative** (pulsing, looping, parallax): `animation: none`
- **Functional entrances** (modals, dialogs, toasts): opacity-only, remove `transform`
- **State feedback** (hover color, focus ring color): leave unchanged
