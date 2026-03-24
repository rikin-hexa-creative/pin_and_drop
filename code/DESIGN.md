# Design System: High-End Fashion Editorial

## 1. Overview & Creative North Star

The "Creative North Star" for this design system is **The Digital Curator**. Unlike standard e-commerce platforms that prioritize utility over aesthetics, this system treats the interface as a high-end fashion lookbook. It is a space where the garment is the protagonist, and the UI is the gallery wall.

To break the "template" look common in retail, we utilize **Asymmetric Precision**. This means moving away from perfectly repetitive 4x4 grids in favor of mixed-size image tiles that create a rhythmic, editorial flow. Overlapping elements, such as text cards bleeding over hero images, add a sense of physical depth—mimicking the layout of a premium print magazine.

## 2. Colors

Our palette is rooted in a monochromatic foundation to ensure that the diverse colors of high-end streetwear do not clash with the interface.

### The Foundation

-   **Primary (`#000000`)**: Used for high-contrast elements, sharp-edged buttons, and foundational text.

-   **Secondary/Accent (`#bc0000`)**: Reserved for urgent alerts or critical sale indicators. Use sparingly to maintain a premium feel.

-   **Surface (`#fbf9f8`)**: A warm, off-white gallery background that feels more organic and high-end than a sterile `#ffffff`.

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit adjacent to a `surface` background to create a clean, modern break without the clutter of a stroke.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers.

-   Use `surface-container-lowest` (`#ffffff`) for cards or floating elements to make them "pop" against the standard `surface`.

-   Use `surface-dim` (`#dbdad9`) for footer regions or background utility areas to ground the layout.

### The "Glass & Signature" Rule

To move beyond a flat "out-of-the-box" feel:

-   **Glassmorphism:** For floating navigation or search bars, use semi-transparent surface colors with a `backdrop-blur` of 20px.

-   **Signature Gradients:** For primary CTAs, use a subtle transition from `primary` (`#000000`) to `primary-container` (`#1b1b1b`) to give buttons a "carbon" depth rather than a flat, dead black.

## 3. Typography

The typography is the voice of the brand: bold, authoritative, and unapologetically modern.

-   **Display & Headlines (Inter/SF Pro):** Heavy weights with tight letter-spacing. These are the "headlines" of our magazine. Use `display-lg` (3.5rem) for major editorial moments to create a "brutalist" impact.

-   **Titles (Inter/SF Pro):** Used for product names and category headers. Maintain a strict black color (`#000000`) for high legibility.

-   **Labels (Space Grotesk):** We switch to a more technical, monospace-leaning font for labels (`label-md`). This adds a layer of "streetwear utilitarianism"—reminiscent of garment care tags and technical specs.

## 4. Elevation & Depth

In this system, depth is communicated through **Tonal Layering** rather than drop shadows.

-   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` section. This creates a soft, natural lift that mimics fine paper stacked on a desk.

-   **Ambient Shadows:** Shadows are a last resort. If required, they must be "Ambient": Extra-diffused (blur: 40px+) and low-opacity (4%-6%). The shadow color should be a tinted version of the `on-surface` color to look like light hitting a real object.

-   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at 15% opacity. **Forbid 100% opaque, high-contrast borders.**

-   **Integration:** Use semi-transparent layers so the colors of product photography bleed through the UI, making the interface feel like part of the image rather than a sticker on top of it.

## 5. Components

### Buttons

-   **Primary:** Sharp-edged (0px radius), `primary` background, `on-primary` text. Use all-caps for a bold, editorial feel.

-   **Secondary:** Transparent background with a "Ghost Border" (15% opacity).

-   **Interactive State:** On hover, the background should shift from `primary` to `primary-fixed-variant` with a swift 150ms transition.

### Cards & Image Tiles

-   **Strict Rule:** Forbid the use of divider lines. Separate content using vertical white space (referencing the `16` or `20` spacing scale).

-   **Image Treatment:** All product images must have a 0px border-radius. In editorial sections, use "Mixed-Size Tiles" where one image takes 66% of the container and two smaller images take the remaining 33%.

### Input Fields

-   **Styling:** Minimalist bottom-border only (`outline-variant` at 20% opacity). On focus, the border shifts to `primary` (#000000).

-   **Labels:** Use `label-sm` in all-caps, positioned 4px above the input.

### Custom Component: The "Editorial Overlay"

A floating white card (`surface-container-lowest`) that partially overlaps a high-res image. This card contains the `title-lg` and a "Shop Now" button, creating a layered, curated look.

## 6. Do's and Don'ts

### Do:

-   **Use "White Space as a Border":** Use the `12` (3rem) or `16` (4rem) spacing tokens to separate major sections.

-   **Focus on Imagery:** Let the product photography be the loudest element on the page.

-   **Embrace Asymmetry:** Mix 2-column and 3-column layouts on the same page to keep the user engaged.

### Don't:

-   **No Rounded Corners:** Strictly 0px radius for all buttons, cards, and images. Rounding dilutes the "high-end" brutalist aesthetic.

-   **No Heavy Borders:** Never use a 100% opaque black border to separate sections. Use background color shifts.

-   **No Generic Shadows:** Avoid the "Material Design" look of floating cards with heavy, dark shadows. If it doesn't look like paper, it's too heavy.

-   **No Icon Clutter:** Only use icons where absolutely necessary. When used, ensure they are 1px stroke-weight to match the editorial precision.
