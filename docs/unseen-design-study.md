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

## Second pass: motion and spatial presentation

The first interpretation used an image with parallax. The revised page replaces
that treatment with a real-time WebGL world and independently deforming geometry.

The second browser study covered the home entrance and scene, project gallery,
scroll deformation, a RobCo case study, expanded menu, contact scene, draggable
World gallery, and the mobile homepage. The separate 2025 microsite and every
individual case study were not exhaustively inspected.

The existing REA application analysis was reused, with a focused semantic trace
of the exact buildWater function. Trace evidence:
ev_a55c66c72d4546a98bfb1684a9f9398e6b4d71d7f657dd4ac4962b4581f27756.
It found one exact function with partial coverage. Dynamic this.\* relationships
and the complete runtime dependency graph remain unresolved.

The original theme.js SHA-256 is
6c3681584747634663e6bd980da7c0245b3e034e5f50bbc484da16e3a3c57217.

| Question                               | Evidence and conclusion                                                                                                                                                                         | Coverage                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| What moves on the home page?           | Browser observation corroborates a real scene with moving water and camera. Static code shows a reflector, time-driven noise, pointer fluid input, instanced grass, particles and camera paths. | Answered at the mechanism level; exact live shader parameters are not measured.           |
| Why does selected work feel different? | Browser scrolling visibly bends the previews. REA-backed code shows subdivided image and caption planes, depth folding, fog and eased scrolling.                                                | Answered; the complete dynamic render graph remains unknown.                              |
| How are views connected?               | Home/contact use different viewpoints in a coherent environment. Source shows camera paths and noisy render-target mixing; menu uses sliding panels and staggered text.                         | Observed views, inferred implementation; transition timings are not runtime measurements. |
| How does World differ?                 | Browser dragging rotates a spatial gallery with trails. Source identifies two-axis inertia and velocity-dependent afterimages.                                                                  | Answered as a separate design pattern; no social content is reused.                       |

Useful original bundle locations are line 2, zero-based columns:
buildWater 274036–280269; updateCameraPosition 293991–295124;
buildProjects 325717–328009; positionProjects 328009–330754;
updateScrollPos 337229–337356; menu sequence 180489–181810.

## Refinement: coherence, pointer response and soft surfaces

The follow-up reused the same REA application evidence and corroborated the
home pointer response and project scrolling in the browser. The supplied
8.6-second gallery recording additionally established the soft, continuous
wobble the user wanted. No identical analysis was rerun.

The original shared media shader (columns 300428–302100) bends each vertex
according to world Y, adds slow depth variation, and fades the receded part by
depth. It does not read the gallery's scroll-velocity uniform. The scroll handler
eases the rendered position toward its target. The hover code (339355–339774)
zooms the texture inside the existing surface boundary. Hero pointer response
combines camera yaw/pitch with water and headline fluid effects; the headline
setup is at 282563–286144. These are static implementation findings, not live
measurements of shader values or timings.

Our equivalent uses an original cylindrical roll with depth fading, bounded
surface waves, and a small, damped pointer displacement. The hero uses a finite
history of expanding ripple wakes and a CSS text-color wash, rather than the
reference's fluid solver or headline texture distortion.

## Original implementation

The alternate page uses an original kinetic ribbon sculpture, folded paper forms,
a reflective rippling floor, a blue/peach/green palette, new Patch & Flow copy,
and the existing four studio concepts.
No reference-site code, images, models, fonts, or audio are shipped.

The scene uses a locally vendored, version-pinned Three.js 0.186.1 and its MIT
licensed Reflector utility. The renderer, procedural environment, ribbon
geometry, wave shader, gallery shaders and camera choreography are authored for
Patch & Flow. No reference-site source was used as implementation code.

- One closed ribbon deforms within bounded dimensions, with a periodic seam.
  Two distant folds stay outside its full depth range. The second ribbon,
  intersecting plinths, ring, and floating folios have been removed.
- A mirrored camera renders actual scene reflections; the custom floor shader
  distorts reflections over time and retains a short wake after pointer movement.
- Pointer movement orbits the camera, gently lifts nearby ribbon geometry, and
  moves a restrained terracotta wash across the headline. Motion is damped using
  elapsed time rather than a fixed per-frame interpolation factor.
- The gallery uses a quiet reflective background. Project previews render on
  32 × 40 subdivided surfaces and progressively roll into depth. Curvature stays
  when scrolling stops; depth fading hides the distant tail. A continuous soft
  wobble and a bounded local pointer response add elasticity. Hover zooms the
  texture by 2.5%, without introducing a separate whole-card wobble.
- Real DOM captions follow the curve's tangent; links and image descriptions
  remain accessible. The native scroll gains a small bounded visual lag within
  the gallery. Category selectors and floating hover labels have been removed.
- The menu has a directional wipe and staggered links; project navigation has
  an exit curtain. Ordinary scrolling remains native.

This is an original interpretation of the observed mechanisms. It does not
recreate Unseen's GLB room, grass, butterfly simulation, fluid solver, postprocess
pipeline, or spherical World gallery.

There is no audio gate. System reduced-motion settings and a persisted page
control pause time-based animation and disable the scroll-deformation shader.
The renderer stops behind opaque chapters and while the tab is hidden. Pixel
ratio and reflection resolution are bounded. A static artwork and normal image
links remain when WebGL fails. Content and anchor navigation remain available
without JavaScript. The menu uses a native dialog for focus containment and
Escape-key dismissal.

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
There is no build step or remote runtime CDN dependency. Three.js is vendored in
assets/flow/vendor with its license and provenance. The existing concept routes
under v4/work/ remain unchanged.

## Validation

Checked in the browser at 1280 × 720, 768 × 1024, 390 × 844, and 320 × 700.
No document-level horizontal overflow was present at those sizes.

- Menu opens, Escape dismisses it, and focus returns to the menu button.
  Choosing a section closes the menu and moves focus to that section.
- All four concepts remain visible without a category selector.
- The ribbon update function was sampled at 482 time/pointer-presence states.
  Its seam stayed closed (maximum error below 1e-14), and its minimum sampled
  clearance above the floor was 0.396 scene units at desktop scale. Its full
  depth range stayed more than 2.27 units in front of the conservative backdrop
  boundary. The mobile sculpture is scaled to fit, rather than cropped across
  the whole screen.
- Pointer input produced ripple wakes, camera movement and the headline wash
  in the browser. The gallery recording includes idle surface wobble followed
  by progressive scrolling.
- Comparison arrow keys and End update both the visual split and its accessible
  value description.
- FAQ disclosure, daylight/evening switching, and the motion pause control work.
- Two paused scene captures were pixel-identical. Live scene captures changed
  continuously; short hero and scrolling-gallery recordings were saved for review.
- The refined gallery's paused captures were also pixel-identical, its render
  count stayed fixed, and its captions and scroll lag reset. Re-enabling motion
  no longer replays the entrance curtain.
- Opening the bakery concept and returning with browser Back restored the
  homepage without leaving the navigation curtain visible.
- An empty brief focuses the required business field without opening email.
  An invalid email address was also rejected by native form validation.
  Sending an email was not tested; the page prepares a draft for the visitor's
  email app, with a visible retry link.
- WebGL scene and all four WebGL image surfaces initialized in the preview.
- No browser console errors appeared. The preview's graphics driver emitted
  a shader precision warning; rendering continued successfully.
- Local assets, anchor targets, label associations and font paths passed a file
  audit. Both authored JavaScript modules passed syntax and whitespace checks.

The earlier raster landscape is now a WebGL fallback only. It weighs 134,970
bytes. Reduced-motion behavior is implemented in CSS, the controller and the
renderer; browser checks exercised the page control rather than changing the
operating system's settings. Email delivery and a complete cross-browser or
low-end device performance audit were not performed.
