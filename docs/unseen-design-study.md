# Patch & Flow — an alternative point of view

Branch: codex/unseen-inspired-homepage

Base: main at cd5c8cf7ca36a82ce1579b8374e0f26eaf9525a0.

## Reference and evidence

Reference: https://unseen.co/, inspected on October 8, 2026.

REA 6.0.0 analyzed a local, inert capture of the homepage, its first-party
theme.js bundle, and its Webpack manifest. The stylesheet was also retained
for inspection. Analytics scripts, the vendor bundle, models, textures, audio,
and other remote assets were outside the capture.

Evidence ID:
ev_b336f16afadb623cd015a8b30832f8cc27fde17fe50f21442806812a519f9de7

REA parsed two JavaScript files, visited 100,961 AST nodes, and reported four
bundled modules, 85 findings, and zero parsing failures. Its evidence explicitly
reports incomplete graph coverage: the capture excludes dependencies and
dynamic runtime relationships. Static analysis does not establish execution.
The complete evidence stays outside this repository because it is 129 MB.

Observed visually in the browser:

- A full-viewport, softly lit sculptural environment behind the heading.
- Large italic display type paired with a simple sans serif.
- Minimal corner navigation, a menu control, and a deliberate entrance.
- A scene that responds to movement, plus an optional audio entry.

Observed in the shipped animation source:

- GSAP timeline calls, including expo.inOut easing and a 0.6-second default
  in a button-content transition.
- Mouse and wheel event handlers, transition materials, and references to
  ScrollAnimations, ScrollTrigger, and Dom2Webgl.

These source observations suggest how the animation system is organized;
they are not measurements of the complete live runtime.

## Original interpretation

The alternate page uses a new ribbon-and-storefront landscape, a blue/peach/
green palette, Patch & Flow copy, and the existing four studio concepts.
No reference-site code, images, models, fonts, or audio are shipped.

The motion is implemented with browser-native CSS transitions, keyframes,
IntersectionObserver, and a small requestAnimationFrame loop. It includes
pointer-responsive scene drift, staggered title entrances, a full-screen
dialog menu, restrained magnetic buttons, project reveals, a typographic
ribbon, and an optional daylight/evening mood.

There is no audio gate. System reduced-motion settings are respected, and
visitors can pause decorative motion. Normal scrolling and content remain
available without JavaScript. The menu uses a native modal dialog for focus
containment and Escape-key dismissal.

Existing business functionality is retained: concept-site links, service
information, the keyboard-operable before/after comparison, pricing terms,
payment details, FAQs, and the mailto project brief. Concept work remains
clearly labelled as such.

## Original artwork

Generated with the built-in ImageGen tool, then encoded as WebP without
changing the composition. Project asset: assets/flow/landscape.webp.

Final generation prompt:

> Use case: stylized-concept. Asset type: full-bleed original website hero
> background, wide landscape 16:9, no lettering or UI. Primary request: a
> sophisticated surreal 3D still-life for a small creative web studio called
> Patch & Flow. Scene: an expansive warm ivory and pale apricot studio landscape
> beneath a misty powder-blue sky. A broad terracotta-orange satin ribbon flows
> in an elegant loose continuous loop from the left foreground across the scene
> toward the right, embodying connection and flow. At the far right, sculptural
> folded cream paper and pale-blue pleated fabric forms create an abstract
> little main-street storefront silhouette; at far left a large curved peach
> fabric panel. Materials feel tactile, matte plaster, woven fabric, soft satin.
> Composition: cinematic low camera, generous uncluttered negative space across
> the central upper 60 percent for dark website typography, artwork mainly
> along the lower third and outer edges. Soft late-afternoon light, long gentle
> shadows, refined editorial art direction, polished physically based rendering,
> subtle fine grain. Palette: warm peach, ivory, washed sky-blue, muted
> terracotta. Original design. Avoid pools, stairs, spheres, arches from
> existing websites, cartoon characters, logos, text, watermarks, UI mockups.

## Preview

Serve the repository root with any static HTTP server and open its root page.
There is no build step or new runtime dependency. The existing concept routes
under v4/work/ remain unchanged.

## Validation

Checked in the browser at 1280 × 720, 768 × 1024, 390 × 844, and 320 × 700.
No document-level horizontal overflow was present at those sizes.

- Menu opens, Escape dismisses it, and focus returns to the menu button.
  Choosing a section closes the menu and moves focus to that section.
- Filters show 1 food concept, 2 craft concepts, 1 trade concept, or all 4.
  The live status text and pressed states update with the selection.
- Comparison arrow keys and End update both the visual split and its accessible
  value description.
- FAQ disclosure, daylight/evening switching, and the motion pause control work.
- An empty brief focuses the required business field without opening email.
  Sending an email was not tested; the page prepares a draft for the visitor's
  email app, with a visible retry link.
- No browser console warnings or errors appeared during the interaction checks.
- All 42 HTML asset/link references, IDs, anchor targets, label associations,
  and CSS font paths passed a local file audit. JavaScript syntax and Git
  whitespace checks passed.

The hero is an original raster artwork with layered parallax, rather than a
recreated WebGL environment. The WebP weighs 134,970 bytes. No new build or
runtime packages are required. Reduced-motion behavior is implemented in both
CSS and JavaScript; the browser tests covered the page's pause control rather
than changing the operating system's accessibility settings.
