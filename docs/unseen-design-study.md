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

The alternate page uses the original Patch & Flow landscape as independently
animated artwork layers, a quiet reflective gallery, the existing palette and
four studio concepts. No reference-site code, images, models, fonts or audio ship.
Three.js 0.186.1 and its MIT-licensed Reflector utility are vendored locally.

- The hero is a layered, 2.5D treatment of the selected original artwork. A clean
  background plate sits behind a transparent satin ribbon on a 160 × 72 mesh.
  Travelling waves and a damped local cursor lift deform the ribbon on the GPU;
  its right attachment is fully pinned before the column, avoiding a gap as
  the wave lifts. Procedural masks preserve the main architectural
  occlusions. Its soft ground shadow follows the same displacement field.
- The surrounding artwork responds with depth-weighted cursor parallax and
  restrained fabric sway. Finite expanding ground ripples and the existing
  terracotta headline wash preserve the approved pointer response. Portrait
  framing retains the panorama at the foot of the hero and extends its sky.
- Each gallery card now uses one 32 × 56 mesh for its thumbnail, business name,
  slogan, arrow and metadata. The approved continuous wobble, cylindrical depth
  roll, local pointer response and depth fade act on the entire card together.
  The 2.5% internal hover zoom remains confined to the thumbnail. The quiet floor
  retains its reflection shader.
- Captions are captured from the browser's actual font metrics and line wrapping
  into cached transparent textures. Mipmaps and bounded anisotropic filtering
  smooth the type as the card turns away. Textures rebuild after font, layout or
  content changes, never during ordinary scrolling. The original HTML remains
  for accessible names, native links and the static fallback; it is hidden
  visually only after both card textures are ready. There is no separate caption
  transform, scale or fade, and no new runtime dependency.
- Layout measurements are batched after resize, font loading or observed size
  changes. Scroll frames position cached rectangles arithmetically. The chapter
  indicator changes its content only when the chapter changes. The old hero's
  CPU geometry deformation, environment bake and shadow-map rendering are gone.
- Elapsed-time damping and native scrolling remain. Motion pause resets the
  gallery lag, freezes the artwork and disables surface deformation.
  The frame loop stops behind opaque chapters and when the document is hidden.
  Pixel ratio, reflection resolution and ripple history are bounded.
- Category selectors and floating hover pills remain removed. The native dialog
  menu, directional navigation curtain, reduced-motion preference and static
  artwork fallback remain available.

This is an original adaptation of the observed mechanisms, rather than a copy
of Unseen's models, fluid solver or postprocessing pipeline. The artwork layers
provide depth and deformation within the chosen camera view; they are not a
complete volumetric reconstruction of the pictured architecture.

Existing business content and behavior remain: concepts, services, comparison,
pricing and payment terms, FAQs and the mailto brief. The main branch and the
concept routes under v4/work/ remain unchanged.

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

The unified-card refinement was checked at 1280 × 720, 2084 × 658, 390 × 844
and 320 × 700. The preceding artwork pass also checked 768 × 1024.
There was no document-level horizontal overflow. The mobile gallery retained its
single column; tablet and desktop retained two columns.

- The layered artwork and all four gallery surfaces initialized without browser
  console errors. Pointer input visibly changed the ribbon, surrounding scene
  and headline. Short hero and gallery recordings were saved outside the repo.
- The supplied 18.9-second recording showed the thumbnail turning away while
  its DOM caption followed a different path. The replacement was checked through
  progressive recession, stopping and rapid scroll reversals: the image and
  lettering now share the same curved surface and per-vertex depth fade.
  A new gallery recording was saved outside the repo. Mobile caption wrapping,
  including the stacked metadata at 320 pixels, follows the HTML layout.
- Pausing cleared the grid lag and disabled deformation. Two paused gallery
  captures were pixel-identical, and the render counter stayed at 9600 between
  them. Re-enabling motion preserved the completed entrance. Original HTML
  images and captions are restored on renderer initialization failure or
  context loss; this fallback was checked in source rather than simulated.
- The mobile menu opened, choosing Work dismissed it and focused the section.
- The bakery concept opened and browser Back returned to the homepage. The
  previous artwork pass checked the column attachment across changing pointer
  positions and a complete ribbon-wave cycle after pinning its geometry.
- Both new artwork layers preserve the original 1672 × 941 dimensions; the
  ribbon has a real alpha channel. Their combined WebP size is 204,432 bytes.
- Authored JavaScript passed Node syntax checks. The HTML audit checked 42
  unique IDs, all local asset paths and anchor targets, and four caption groups.
- The existing comparison, brief validation, FAQs and concept navigation were
  verified in the preceding pass; their behavior is retained by this refinement.

The rendering and layout work is reduced, but this is not a quantified frame-rate
benchmark or a complete cross-browser/low-end device performance audit. System
reduced motion is handled by code; browser checks used the page's motion control.
Email sending was not exercised.

## Layered artwork assets and prompts

Built-in ImageGen edit mode derived two non-destructive layers from
assets/flow/landscape.webp. No reference-site artwork was used. The exact original
artwork remains the no-WebGL fallback. Generated PNGs were inspected, then
encoded as WebP with alpha preserved; the original was not overwritten.

Saved project assets:

- C:/Projetos/Patch&Flow/assets/flow/landscape-plate.webp
- C:/Projetos/Patch&Flow/assets/flow/landscape-ribbon.webp

Clean plate prompt (built-in ImageGen, opaque):

> Use case: precise-object-edit. Asset type: clean background plate for a layered interactive website hero. Edit target: the attached original landscape. Remove ONLY the long copper / terracotta satin ribbon that snakes from the lower-left across the ground and into the architecture on the right, including all visible copper ribbon segments and its direct shadows. Inpaint those removed pixels with the same uninterrupted pale warm stone ground, distant scenery or architecture as appropriate. Preserve everything else exactly: original framing and camera, blue cloudy sky, large peach drape at left, flowers and stones, ivory curved buildings and pleated blue fabric at right, lighting, textures, warm palette, horizon. Do not shift, resize, redesign, add objects or crop any element. Keep the same wide 1672:941 aspect ratio and pixel-aligned composition; this plate will sit under the original ribbon. No text or watermark.

Ribbon prompt (built-in ImageGen, transparent):

> Use case: background-extraction. Asset type: pixel-aligned transparent foreground layer for an animated website. Edit target: attached original landscape. Extract ONLY the single copper / terracotta satin ribbon into an actual transparent RGBA image. Preserve the exact original ribbon silhouette, highlights, material, all visible segments, and exact original pixel positions within the FULL original 1672 by 941 wide canvas. The ribbon curves from x~50 y~650 over the left foreground into a low long band along the ground, then forms the low arch at center-right, and snakes up into the architecture at the right. Keep those ribbon pixels in precisely the same composition; all other pixels must be transparent. Remove all buildings, fabric drapes, flowers, rocks, ground and sky; remove ground cast shadows. Do not crop, center, enlarge, redraw, simplify, invent segments or move the ribbon. Preserve transparent holes around the ribbon and transparent occlusions where foreground plants or buildings hide it. No background color, no checkerboard, no text or watermark. Must keep the full original canvas so compositing this layer over the matching background plate reproduces the input.
