# Three.js

Version: 0.186.1. License: MIT; see THREE-LICENSE.txt.

Source package: https://registry.npmjs.org/three/-/three-0.186.1.tgz
Upstream: https://github.com/mrdoob/three.js/tree/r186
Documentation: https://threejs.org/docs/

three.module.min.js bundles the official package's build/three.module.js and
build/three.core.js with esbuild 0.25.12 using --bundle --minify --format=esm.
It has no runtime CDN dependency.

Reflector.js is the official examples/jsm/objects/Reflector.js from that package.
Its sole modification changes the bare 'three' import to './three.module.min.js'.
The application supplies its own reflection-distortion shader.

No code or assets from unseen.co are included here.
