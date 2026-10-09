# WPP Open — case-study design sample

Local review route: `http://127.0.0.1:4173/s/mads-leao/wpp-open/`.

This extends the Mads landing-page sample with one project. WPP Open now links here from the local selected-work list. The other three projects retain their original destinations. This branch is for design review before applying the case-study direction to other projects.

## Content and assets

Source: [Madalena's WPP Open case study](https://madsleao.com/wpp-open/), inspected on 9 October 2026. The narrative is edited and paraphrased for the new composition. The research quote, 8 qualitative interviews, 85 questionnaire responses, 12 contextual card concepts, role, ongoing status and team details come from that source. The page describes proposals and future validation; it does not invent released results or business metrics.

Six original interface images total 679,900 bytes after conversion from RGBA PNG to WebP, retaining transparency and proportions, at a maximum width of 2048 pixels. The original cards overlay is presented on a plain lilac surface to make the comparison clearer. No interface screenshots are recreated or altered. The fonts, color tokens, menu appearance and arrow paths reuse the approved landing-page identity.

## Design and interaction

- Large project typography, an interface cover, project facts and four editorial chapters.
- Native scrolling with a sticky chapter index and reading progress. Section reveals, subtle cover parallax and a pointer-responsive star use the existing motion vocabulary.
- Three keyboard-accessible design tabs, each with Before/After views. Images warm when the explorer approaches the viewport; fixed image stages and caption space keep switches steady.
- Full-image dialogs with fit/actual-size viewing. Both dialogs preserve the page position, trap focus natively, restore focus and close with Escape. The fixed menu close control and continuous curved panel retain the prior feedback fixes.
- Shared session motion preference and system reduced motion. The frame loop sleeps when the hero leaves the viewport, the page is hidden or a dialog opens. Layout is measured on load, resize, font readiness and explicit comparison changes.
- Without JavaScript, the narrative and all comparison images remain readable. Print styles expose both states of all three decisions.

No framework, scroll hijacking, new runtime dependency or third-party script is added.

## Study and verification

REA 6.0.0 performed static analysis on a sanitized rendered HTML capture and the original first-party script. Downloaded JavaScript was parsed, not executed by the CLI. Evidence: `ev_04b1cc25fce936bf20b3886384997d20e5f9002c811cc86da6af289165439fe5`.

Captured source, original images, asset report, Evidence and preview screenshots are outside the repository at:

`C:/Users/duart/.codex/visualizations/2026/10/09/01a1216f-802c-73c1-8ba9-8d79df637e81/wpp-study/`

Checks cover authored JavaScript syntax, formatting, unique IDs, relative assets, image dimensions, chapter anchors and ARIA relationships. Browser review covers desktop, 390px and 320px layouts, all six comparison views, keyboard tab navigation, image enlargement/actual size/Escape, menu focus and dismissal, motion pause/resume and the landing-page round trip. No physical iPhone, Safari or performance benchmark is claimed.
