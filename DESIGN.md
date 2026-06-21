# Academy Pay Design System

## 1. Atmosphere & Identity

Academy Pay is a focused mobile payment helper: quiet, direct, and trustworthy. The signature is a compact phone-like surface with soft neutral layers, clear bank identity, and large tactile actions for copying, opening Toss, and sharing QR codes.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --background | oklch(1 0 0) | oklch(0.145 0 0) | Page background |
| Surface/card | --card | oklch(1 0 0) | oklch(0.205 0 0) | Main panels and sheets |
| Surface/muted | --muted | oklch(0.97 0 0) | oklch(0.269 0 0) | Inputs, secondary tiles |
| Text/primary | --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | Primary text |
| Text/secondary | --muted-foreground | oklch(0.556 0 0) | oklch(0.708 0 0) | Labels and hints |
| Border/default | --border | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | Dividers and outlines |
| Accent/primary | --primary | oklch(0.457 0.24 277.023) | oklch(0.398 0.195 277.366) | Primary actions |
| Accent/primary text | --primary-foreground | oklch(0.962 0.018 272.314) | oklch(0.962 0.018 272.314) | Text on primary actions |
| Shape/default | --radius | 0.625rem | 0.625rem | Component corner radius |
| Status/warning | --warning | oklch(0.53 0.13 72) | oklch(0.74 0.14 72) | Account format warning |
| Status/error | --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | Blocking errors |

### Rules

- Use semantic shadcn tokens in JSX and CSS.
- Bank logos provide brand color; the app chrome stays neutral.
- Bank selection uses local 48px SVG symbols when available; unavailable banks use the direct input path.
- Warning color is reserved for account-format guidance.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| H1 | 28px | 800 | 1.2 | 0 | Screen title |
| H2 | 22px | 700 | 1.3 | 0 | Sheet title |
| Body/lg | 18px | 700 | 1.45 | 0 | Account number |
| Body | 16px | 500 | 1.5 | 0 | Inputs and buttons |
| Body/sm | 14px | 500 | 1.45 | 0 | Supporting text |
| Caption | 12px | 600 | 1.4 | 0 | Labels and metadata |

### Font Stack

- Primary: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- Mono: ui-monospace, SFMono-Regular, Menlo, monospace

### Rules

- Body text never goes below 14px except compact labels.
- Account numbers use tabular numeric rendering.
- Letter spacing remains 0.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Tight icon gaps |
| --space-2 | 8px | Compact groups |
| --space-3 | 12px | Field inner rhythm |
| --space-4 | 16px | Standard vertical gap |
| --space-5 | 20px | Screen side padding |
| --space-6 | 24px | Card and sheet padding |
| --space-8 | 32px | Major section gap |

### Grid

- Max content width: 440px.
- Bank selector uses a 3-column mobile grid.
- Full-height screens use `100dvh` constraints.

### Rules

- Form controls share the same width and left alignment.
- Repeated controls use 12px or 16px gaps.
- Avoid nested cards; sheets and repeated bank tiles are the only framed surfaces.

## 5. Components

### Payment surface

- **Structure**: app shell, top bar, main card content, action stack.
- **Variants**: builder, pay.
- **Spacing**: 20px page padding, 24px card padding, 16px field gap.
- **States**: empty, complete, disabled submit, warning, optional amount, memo, nickname.
- **Accessibility**: semantic main/section, labeled fields, focus-visible rings.
- **Motion**: standard 200ms transition on interactive states.

### Bottom sheet

- **Structure**: shadcn sheet, header, content, footer action.
- **Variants**: bank selector, QR selector.
- **Spacing**: 24px horizontal padding, 12px internal gaps.
- **States**: open, closed, selected tab/tile, direct bank input selected.
- **Accessibility**: required sheet title, modal semantics from component.
- **Motion**: component-provided transform transition.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease-out | Button hover and press |
| Standard | 200ms | ease-in-out | Sheet and tab state changes |

### Rules

- Animate opacity and transform only.
- Every button, tile, input, and checkbox keeps a visible focus state.
- Respect reduced motion through browser defaults and component behavior.

## 7. Depth & Surface

### Strategy

Mixed: tonal shifts for form fields and bank tiles, subtle shadows only for the main phone surface and modal sheets.

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | 0 1px 2px rgba(15, 23, 42, 0.04) | Tiles at rest |
| Default | 0 18px 60px rgba(15, 23, 42, 0.12) | Main surface |
| Prominent | 0 24px 80px rgba(15, 23, 42, 0.18) | Sheets |
