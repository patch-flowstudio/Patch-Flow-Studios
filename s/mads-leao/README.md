# Madalena Leão — landing-page sample

Independent, buildless client concept at `/s/mads-leao/`. It is deliberately absent from the Patch & Flow homepage, gallery and sitemap. WPP Open has a local [case-study design sample](./wpp-open/README.md); the other project links open the existing Mads case studies. The sample has a `noindex` directive.

Local preview: `http://127.0.0.1:4173/s/mads-leao/`

From the repository root, run `python -m http.server 4173 --bind 127.0.0.1`. All asset references are relative, so the same directory works under the repository's GitHub Pages base path.

## Identity and content

Verified against [Mads Leão](https://madsleao.com/) on 9 October 2026:

- Electric blue `#293efd`, lilac `#e4e7fb`, cream `#fcfbf6`, ink `#0e0e0e`.
- Original Clash Display Medium / Semibold headings and Inter Regular body font.
- Original hero wording, Lisbon/WPP role, four projects, biography, contact details and about-poster art. Intro and section headings are edited for the landing-page composition; no achievements, clients or metrics are invented.
- Original project thumbnails downloaded from the rendered page's observed assets and resized as WebP. Four images total 304,768 bytes, versus 4,386,229 source PNG bytes. Original screenshots remain unchanged apart from resize/compression; Europcar's original alpha transparency is preserved.
- Inter is converted from the site's original TTF to a Latin/extended-Latin and punctuation WOFF2 subset (29,308 bytes). Original Clash WOFF2 files are unchanged. Assets remain the client's material.

## Reverse-engineering study

REA 6.0.0 parsed inert first-party source captures; downloaded reference JavaScript was not executed by the CLI. Browser observations were separate. The complete Evidence JSON and captures are preserved outside this repository:

`C:/Users/duart/.codex/visualizations/2026/10/09/01a1216f-802c-73c1-8ba9-8d79df637e81/`

- Mads: `mads-study/rea-evidence.json`, Evidence `ev_d5173624f75f62257929c6eb3b7a16581a573c77f679cd32342154083bdf813d`. Inert HTML capture excludes Cloudflare and browser-injected scripts. One first-party JS file parsed; zero parse failures or truncated scopes. Its existing progressive reveals, reduced-motion early return and focus handling are visible in `app.js`.
- Dennis: `dennis-study/rea-evidence.json`, Evidence `ev_c3e630bb3d46be4a349b3f0ab8843e7ea5435d0b9d9533f89097379b8ba9d00d`. `dennis-study/findings.json` records individual observations, source locations and unknowns.

[Dennis's first-party script](https://dennissnellenberg.com/assets/js/index-new.js) reveals magnetic targets/text (lines 611–697), separate damped preview followers (703–813), a cloned 18-second name marquee with scroll-direction reversal (977–1025), and footer curve/arrow updates (1270–1313). [Its stylesheet](https://dennissnellenberg.com/assets/css/style-new.css) implements the entering menu with a clipped oversized ellipse and roughly 0.8-second translation (237–447). The parent browser study corroborated the moving name, editorial work rows, floating project preview and persistent circular menu control. The two-row image strip is commented out in the captured homepage; it was not treated as active behavior.

This sample uses original HTML/CSS/JS to adapt those principles to Mads's identity. No Dennis media, fonts, source code, routing system or dependencies are transplanted. Static analysis does not prove runtime execution, frame rate or device performance.

## Motion and performance

- Native scrolling; no scroll hijack, loader, framework, CDN script, GSAP, WebGL or AJAX routing.
- One on-demand frame loop uses time-based damping and transform updates. Layout measurements are cached on resize/font readiness. Hero/marquee stop when offscreen, animation stops when hidden, and background motion stops behind the modal menu.
- Shared transform-based project preview with a quicker circular follower; stationary link hit areas and softly damped magnetic surfaces.
- Masked opening type, pointer-responsive stars/ambient gradients, a scrolling name strip that reverses gently, poster parallax, and a cream-to-blue curved footer.
- Fine-pointer gating; touch users retain large inline thumbnails. Native links and readable HTML remain available without motion.
- System reduced-motion CSS/JS and a session-scoped pause control. System reduced motion is respected rather than overridden. Native modal dialog provides focus containment, Escape dismissal and focus restoration.

## Verification

Authored JavaScript syntax and formatting, local HTTP responses, relative assets, unique IDs, anchors and four original case-study links checked. Browser checks cover desktop, tablet and 390/320px layouts, image/font readiness, hover preview, menu open/close/Escape/focus, section navigation and pause/resume. No console warnings or errors observed. No physical-device benchmark or production Lighthouse/FPS result is claimed.

Public sample route: `https://patch-flowstudio.github.io/Patch-Flow-Studios/s/mads-leao/`. It is not linked from the studio homepage.

## Client feedback — 9 October 2026

- All interface arrows are inline SVG paths, rather than Unicode characters that iOS may display as emoji. The hero CTA and blue-footer accent point up and right; the scroll indicator retains its directional meaning.
- Work/About/Contact labels are removed from the outer header. Section navigation is inside the menu.
- Europcar keeps its original transparency, with no artificial image backing, rounded frame or drop shadow in its thumbnail/hover preview.
- The menu curve has a straight joining edge overlapping the panel by two pixels. Its previous detached ellipse could leave gaps during travel.
- Opening the previous dialog reproduced a transient horizontal scroll as the browser focused an offscreen close button. The close control is now fixed outside the animated panel and explicitly owns autofocus. The dialog uses `overflow: clip`, while a separate inner container can scroll on short screens. See [MDN dialog focus guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) and [overflow behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow).
- Opening/closing state cancels queued opening frames. Background scroll is preserved with a fixed body; menu anchor navigation runs after closing. Escape, outside click and focus restoration remain available.

Verification is through the local desktop browser at desktop and mobile viewport sizes. No physical iPhone or Safari session is available here; SVG paths eliminate the emoji font dependency, but device testing is still distinct from viewport testing.
