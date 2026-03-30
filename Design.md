# Design System: The Obsidian Architect

## 1. Overview & Creative North Star: "Precision Noir"
This design system is built for the high-performance developer—one who values the tactile precision of a physical mechanical keyboard and the focused silence of a night-time IDE session.

Our Creative North Star is **Precision Noir**. Unlike standard "Dark Mode" templates that feel like washed-out gray boxes, Precision Noir treats the UI as a series of deep, obsidian-like planes. We move beyond the "flat web" look by utilizing intentional asymmetry, high-contrast typography scales for "code-like" clarity, and a rigid adherence to depth through tonal shifts rather than structural lines. The goal is an editorial experience that feels less like a website and more like a bespoke macOS utility.

## 2. Color & Tonal Depth
The palette is rooted in a spectrum of charcoal and midnight neutrals, punctuated by highly specific functional accents. The primary color mode for this system is **dark**.

### The "No-Line" Rule
To achieve a premium, integrated feel, **1px solid borders are strictly prohibited for sectioning.** You must define boundaries through background color shifts. For example:
* A Sidebar (`surface-container-low`) sits directly against the Main Workspace (`surface`).
* The distinction is made by the 4% difference in luminosity, not a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers. Use the `surface-container` tiers to create "natural" depth:
* **Base Layer:** `surface` (#0e0e0e) - The infinite canvas.
* **Secondary Sections:** `surface-container-low` (#131313) - Use for sidebars or navigation rails.
* **Primary Cards:** `surface-container-highest` (#252626) - Use for active task cards or modals.
* **The "Glass" Rule:** For floating AI elements or overlays, use `surface-variant` at 60% opacity with a `20px` backdrop-blur. This allows the underlying content to "bleed" through, softening the interface.

### Signature Accents
Accents must be used sparingly as "data-driven signals," not decoration:
* **Productive:** `secondary` (#43aea4) — A muted, professional teal.
* **Slow:** `tertiary` (#ffc87f) — A warm, amber glow for friction points.
* **AI Elements:** `primary` (#dab9ff) — A sophisticated violet-blue to denote intelligence.

## 3. Typography
We use a dual-sans approach to balance technical precision with editorial authority.

* **The Technical Core (Inter):** Used for all `body`, `label`, and `title` scales. It provides the high-readability required for logs, code snippets, and task lists.
* **The Editorial Voice (Manrope):** Reserved for `display` and `headline` scales. Manrope’s geometric qualities feel architectural and intentional, breaking the monotony of standard "developer" interfaces.
* **Code-Like Clarity:** Use `title-sm` with `0.05em` letter-spacing for headers to mimic the look of a high-end terminal header.

## 4. Elevation & Depth
In this system, elevation is a product of light and layering, not shadows.

* **Tonal Layering:** To lift a card, do not reach for a shadow. Instead, place a `surface-container-highest` object on a `surface-container-low` background. The eye perceives the shift in value as a shift in physical height.
* **Ambient Shadows:** If an element must float (e.g., a Command Palette), use a "Whisper Shadow": `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow must feel like ambient light being occluded, not a blurry black smudge.
* **The "Ghost Border" Fallback:** If high-density layouts require a container boundary, use the `outline-variant` token (#484848) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Buttons
* **Primary:** Uses a subtle gradient from `primary` (#dab9ff) to `primary-dim` (#cfa7ff). Roundedness: `md` (0.75rem).
* **Secondary:** Ghost-style. No fill, `Ghost Border` (15% outline-variant).
* **Tertiary:** Text-only, using `on-surface-variant` for an understated look.

### The "Obsidian" Cards
* **Rule:** Forbid divider lines within cards.
* **Separation:** Use `spacing-6` (1.5rem) of vertical white space or a internal nesting of `surface-container-lowest` to separate header from content.
* **Corner Radius:** Consistently use `lg` (1rem) for containers and `md` (0.75rem) for internal elements to create a nested "macOS" nesting effect.

### Input Fields
* **State:** Default state uses `surface-container-highest` with no border.
* **Focus State:** A 1px focus ring using `primary` (#dab9ff) with a 2px outer glow of the same color at 20% opacity.

### AI-Augmented Elements
* **Glassmorphism:** Use `surface-variant` at 40% opacity with `backdrop-filter: blur(12px)`.
* **Pulse:** When AI is "thinking," use a subtle breathing animation on the `primary-container` background.

## 6. Do's and Don'ts

### Do
* **Do** use asymmetrical layouts. For example, a wider right margin in a task list to allow the UI to "breathe."
* **Do** use `surface-bright` (#2b2c2c) for hover states on dark buttons to create a "sheen" effect.
* **Do** lean on `label-sm` for metadata—it should feel like "fine print" in a technical manual.

### Don't
* **Don't** use pure white (#FFFFFF) for text. Always use `on-surface` (#e7e5e5) to reduce eye strain.
* **Don't** use 100% opaque borders. It breaks the illusion of a singular, molded obsidian surface.
* **Don't** use "Standard" easing. Use `cubic-bezier(0.23, 1, 0.32, 1)` (Classic macOS ease-out) for all transitions to maintain the premium feel.