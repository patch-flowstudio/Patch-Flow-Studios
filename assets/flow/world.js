import * as THREE from "./vendor/three.module.min.js";
import { Reflector } from "./vendor/Reflector.js";

// Original geometry, materials and motion. No models or textures from the reference.
export function createWorld({ canvas, enabled = true }) {
  const root = document.documentElement;
  const host = canvas.parentElement;
  const hero = document.getElementById("top");
  const work = document.getElementById("work");
  const contact = document.getElementById("contact");
  const media = [...document.querySelectorAll(".project-media")];
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.autoClear = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e8dcd2");
  scene.fog = new THREE.Fog("#e8dcd2", 15, 42);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 90);
  const gallery = new THREE.Scene();
  const galleryCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
  const rig = new THREE.Group();
  scene.add(rig);
  const pointer = new THREE.Vector2();
  const currentPointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const ripplePoint = new THREE.Vector3();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let width = document.documentElement.clientWidth,
    height = innerHeight,
    raf = 0,
    time = 0,
    previousTime = 0;
  let lastScroll = scrollY,
    velocity = 0,
    mood = 0,
    targetMood = 0,
    renderCount = 0;
  let disposed = false,
    contextLost = false,
    dirty = true;
  let pointerStrength = 0;
  const materials = [];
  const ribbonGeometries = [];
  const disposables = [];
  const peach = new THREE.Color("#e8dcd2");
  const galleryColor = new THREE.Color("#e9ece6");
  const eveningColor = new THREE.Color("#cec6dd");
  const paper = new THREE.MeshStandardMaterial({
    color: "#ead9c6",
    roughness: 0.87,
    metalness: 0.02,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: "#a6becb",
    roughness: 0.48,
    metalness: 0.12,
  });
  const terracotta = new THREE.MeshStandardMaterial({
    color: "#c77852",
    roughness: 0.72,
  });
  materials.push(paper, blue, terracotta);

  // A small procedural studio environment supplies highlights without an HDR download.
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#dbe3e7");
  const envShell = new THREE.Mesh(
    new THREE.BoxGeometry(30, 25, 30),
    new THREE.MeshBasicMaterial({ color: "#c9b9aa", side: THREE.BackSide }),
  );
  envScene.add(envShell);
  const lightCards = [
    [-6, 8, 0, 6, 12, 3.5],
    [8, 4, 0, 5, 10, 2],
    [0, 10, -8, 14, 8, 2.8],
  ];
  lightCards.forEach(([x, y, z, w, h, intensity]) => {
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setScalar(intensity),
      side: THREE.DoubleSide,
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    envScene.add(panel);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(envScene, 0.08);
  scene.environment = environment.texture;
  pmrem.dispose();
  envScene.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
  });
  const hemi = new THREE.HemisphereLight("#e6f1ff", "#b68668", 2.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff0dc", 4.2);
  sun.position.set(-5, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -12,
    right: 12,
    top: 10,
    bottom: -10,
    near: 0.1,
    far: 35,
  });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#a9d2ec", 1.6);
  fill.position.set(6, 4, -4);
  scene.add(fill);

  function mesh(geometry, material, x, y, z) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    rig.add(object);
    return object;
  }
  // Off-centre paper forms and floating folios, rather than a copied architectural room.
  mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.28, 80), paper, -5, -0.02, -2);
  mesh(
    new THREE.CylinderGeometry(1.75, 1.75, 0.6, 80),
    terracotta,
    5,
    0.12,
    -3.1,
  );
  const finGroup = new THREE.Group();
  finGroup.position.set(5, 1.6, -3.1);
  for (let i = 0; i < 11; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 3.5, 1.6), blue);
    fin.position.set((i - 5) * 0.25, Math.sin(i * 0.35) * 0.14, 0);
    fin.rotation.y = (i - 5) * 0.12;
    fin.castShadow = true;
    fin.receiveShadow = true;
    finGroup.add(fin);
  }
  rig.add(finGroup);
  const paperGeometry = new THREE.PlaneGeometry(2.8, 4.7, 20, 28);
  const paperPositions = paperGeometry.attributes.position;
  for (let i = 0; i < paperPositions.count; i++) {
    const x = paperPositions.getX(i),
      y = paperPositions.getY(i);
    paperPositions.setZ(i, Math.sin(x * 1.3) * 0.65 + Math.cos(y * 0.7) * 0.3);
  }
  paperGeometry.computeVertexNormals();
  const foldedMaterial = paper.clone();
  foldedMaterial.side = THREE.DoubleSide;
  materials.push(foldedMaterial);
  const paperFold = mesh(paperGeometry, foldedMaterial, -6.5, 1.9, -3);
  paperFold.rotation.set(0.12, -0.5, -0.18);
  const ring = mesh(
    new THREE.TorusGeometry(0.8, 0.095, 16, 70),
    blue,
    -4.5,
    1.3,
    -2,
  );
  ring.rotation.set(0.45, 0.5, 0);
  const floating = [];
  for (let i = 0; i < 9; i++) {
    const object = mesh(
      new THREE.BoxGeometry(0.34, 0.5, 0.025),
      i % 2 ? paper : blue,
      Math.sin(i * 2.4) * 7,
      2 + Math.cos(i * 1.4) * 1.6,
      -3 - Math.abs(Math.cos(i)) * 3,
    );
    object.rotation.set(i * 0.3, i * 0.8, i * 0.2);
    floating.push({ object, base: object.position.clone(), phase: i * 1.7 });
  }

  function makeRibbon(color, phase, scale) {
    const count = 192,
      cross = 8;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((count + 1) * (cross + 1) * 3);
    const uvs = new Float32Array((count + 1) * (cross + 1) * 2);
    const indices = [];
    for (let i = 0; i <= count; i++)
      for (let j = 0; j <= cross; j++) {
        const n = i * (cross + 1) + j;
        uvs[n * 2] = i / count;
        uvs[n * 2 + 1] = j / cross;
        if (i < count && j < cross) {
          const a = n,
            b = n + cross + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const material = new THREE.MeshPhysicalMaterial({
      color,
      side: THREE.DoubleSide,
      metalness: 0.28,
      roughness: 0.27,
      clearcoat: 0.5,
      clearcoatRoughness: 0.32,
      sheen: 0.7,
      sheenColor: new THREE.Color("#ffc99c"),
      sheenRoughness: 0.5,
      envMapIntensity: 0.8,
    });
    const object = mesh(geometry, material, 0, 0, 0);
    object.frustumCulled = false;
    const ribbon = { geometry, positions, count, cross, phase, scale, object };
    ribbonGeometries.push(ribbon);
    materials.push(material);
    return ribbon;
  }
  const mainRibbon = makeRibbon("#c66d45", 0, 1);
  const echoRibbon = makeRibbon("#e8bc99", 2.7, 0.75);
  echoRibbon.object.position.set(1.2, 0.5, -3);
  echoRibbon.object.rotation.y = 0.45;

  function deformRibbon(ribbon, t) {
    const { positions, count, cross, phase, scale } = ribbon;
    const p = t * 0.42 + phase;
    for (let i = 0; i <= count; i++) {
      const u = (i / count) * Math.PI * 2;
      const x = Math.sin(u) * 5.8 * scale;
      const y =
        (1.18 + Math.sin(u * 2 + p) * 0.75 + Math.cos(u - p * 0.65) * 0.4) *
        scale;
      const z = (Math.cos(u) * 2.4 + Math.sin(u * 2 - p) * 0.45) * scale;
      const twist = u * 1.5 + Math.sin(u * 2 + p) * 0.8 + p * 0.3;
      const breadth = (0.58 + 0.15 * Math.sin(u * 3 + p)) * scale;
      for (let j = 0; j <= cross; j++) {
        const v = (j / cross - 0.5) * 2;
        const n = (i * (cross + 1) + j) * 3;
        positions[n] = x + Math.cos(u) * Math.sin(twist) * v * breadth * 0.4;
        positions[n + 1] =
          y + Math.cos(twist) * v * breadth + Math.sin(v * Math.PI) * 0.045;
        positions[n + 2] = z + Math.sin(twist) * v * breadth;
      }
    }
    ribbon.geometry.attributes.position.needsUpdate = true;
    ribbon.geometry.computeVertexNormals();
  }

  const waterShader = {
    uniforms: {
      color: { value: new THREE.Color("#cad9dc") },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      uTime: { value: 0 },
      uRipple: { value: new THREE.Vector2() },
      uStrength: { value: 0 },
    },
    vertexShader:
      "uniform mat4 textureMatrix; varying vec4 vMirror; varying vec3 vPosition; void main(){ vPosition=position; vMirror=textureMatrix*vec4(position,1.); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: [
      "uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRipple; uniform float uStrength;",
      "varying vec4 vMirror; varying vec3 vPosition;",
      "void main(){",
      "vec2 uv=vMirror.xy/vMirror.w; vec2 p=vPosition.xy;",
      "float d=distance(p,uRipple);",
      "float ring=sin(d*5.5-uTime*3.5)*exp(-d*.48)*uStrength;",
      "float w1=sin(p.x*2.1+p.y*1.2+uTime*.75);",
      "float w2=sin(p.y*3.6-p.x*.7-uTime*1.1);",
      "vec2 bend=vec2(w1*.0026,w2*.0022)+vec2(ring)*.008;",
      "vec3 reflection=texture2D(tDiffuse,uv+bend).rgb;",
      "float silk=pow(.5+.5*sin(p.x*2.+p.y*3.4+uTime),14.);",
      "vec3 base=mix(color,reflection,.43)+silk*.028;",
      "gl_FragColor=vec4(base,1.);",
      "#include <tonemapping_fragment>",
      "#include <colorspace_fragment>",
      "}",
    ].join("\n"),
  };
  const water = new Reflector(new THREE.PlaneGeometry(70, 70), {
    textureWidth: 512,
    textureHeight: 512,
    multisample: 0,
    clipBias: 0.005,
    shader: waterShader,
    color: "#cad9dc",
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.22;
  scene.add(water);
  // Soft grounding underneath the sculpture, reflected alongside it.
  const shadow = mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.ShadowMaterial({ opacity: 0.13 }),
    0,
    -0.2,
    0,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.castShadow = false;

  const previewVertex = [
    "uniform float uVelocity; uniform float uTime; uniform float uHover; uniform float uMotion; uniform vec2 uPointer; uniform vec2 uViewport;",
    "varying vec2 vUv;",
    "void main(){ vUv=uv; vec4 p=modelMatrix*vec4(position,1.);",
    "float wave=sin(uv.x*3.14159265);",
    "p.y+=wave*uVelocity*29.; p.z+=sin(uv.y*3.14159265)*abs(uVelocity)*70.;",
    "p.z+=sin(uv.x*6.+uTime)*sin(uv.y*3.14159265)*uHover*14.;",
    "float fold=max(0.,p.y-uViewport.y*.12)*uMotion;",
    "p.z-=fold*fold/(uViewport.y*.6); p.y-=pow(fold/uViewport.y,2.)*uViewport.y*.35;",
    "gl_Position=projectionMatrix*viewMatrix*p; }",
  ].join("\n");
  const previewFragment = [
    "uniform sampler2D uImage; uniform vec2 uImageSize; uniform vec2 uPlaneSize; uniform float uHover; uniform float uAlpha;",
    "varying vec2 vUv;",
    "void main(){ vec2 uv=vUv; float i=uImageSize.x/uImageSize.y; float p=uPlaneSize.x/uPlaneSize.y;",
    "vec2 crop=i>p?vec2(p/i,1.):vec2(1.,i/p);",
    "uv=(uv-.5)*crop/(1.+uHover*.055)+.5;",
    "vec4 c=texture2D(uImage,uv); gl_FragColor=vec4(c.rgb,uAlpha);",
    "#include <colorspace_fragment>",
    "}",
  ].join("\n");
  const previews = media.map((element) => {
    const image = element.querySelector("img");
    const uniforms = {
      uImage: { value: null },
      uImageSize: { value: new THREE.Vector2(1600, 1000) },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uVelocity: { value: 0 },
      uMotion: { value: enabled ? 1 : 0 },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uViewport: { value: new THREE.Vector2(width, height) },
      uAlpha: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: previewVertex,
      fragmentShader: previewFragment,
      transparent: true,
      depthTest: false,
    });
    const object = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 24, 24),
      material,
    );
    object.frustumCulled = false;
    gallery.add(object);
    const item = { element, image, object, uniforms, hover: 0, ready: false };
    new THREE.TextureLoader().load(
      image.getAttribute("src"),
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        uniforms.uImage.value = texture;
        uniforms.uImageSize.value.set(
          texture.image.width,
          texture.image.height,
        );
        item.ready = true;
        element.classList.add("webgl-media");
        disposables.push(texture);
        dirty = true;
        wake();
      },
      undefined,
      () => {
        item.ready = false;
      },
    );
    const link = element.closest("a");
    link.addEventListener("pointerenter", () => {
      item.hover = 1;
      wake();
    });
    link.addEventListener("pointerleave", () => {
      item.hover = 0;
      wake();
    });
    link.addEventListener("focus", () => {
      item.hover = 1;
      wake();
    });
    link.addEventListener("blur", () => {
      item.hover = 0;
      wake();
    });
    return item;
  });
  const targetPosition = new THREE.Vector3(),
    targetLook = new THREE.Vector3(),
    look = new THREE.Vector3(0, 1.65, 0);
  camera.position.set(0, 4, 12.5);

  function resize() {
    width = document.documentElement.clientWidth;
    height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    galleryCamera.aspect = width / height;
    galleryCamera.position.z =
      height / 2 / Math.tan(THREE.MathUtils.degToRad(22.5));
    galleryCamera.updateProjectionMatrix();
    previews.forEach((p) => p.uniforms.uViewport.value.set(width, height));
    dirty = true;
    wake();
  }
  function wake() {
    if (!raf && !disposed && !contextLost && !document.hidden)
      raf = requestAnimationFrame(draw);
  }
  function draw(now) {
    raf = 0;
    if (disposed || contextLost || document.hidden) return;
    const dt = Math.min((now - (previousTime || now)) / 1000, 0.05);
    previousTime = now;
    if (enabled) time += dt;
    const y = scrollY,
      delta = y - lastScroll;
    lastScroll = y;
    velocity = THREE.MathUtils.lerp(
      velocity,
      enabled
        ? THREE.MathUtils.clamp((delta / (dt * 1000 || 16)) * 0.35, -1.6, 1.6)
        : 0,
      0.15,
    );
    currentPointer.lerp(enabled ? pointer : new THREE.Vector2(), 0.045);
    mood = THREE.MathUtils.lerp(mood, targetMood, 0.035);
    const workRect = work.getBoundingClientRect();
    const contactRect = contact.getBoundingClientRect();
    const heroRatio = THREE.MathUtils.clamp(y / hero.offsetHeight, 0, 1);
    const inWork = workRect.top < height && workRect.bottom > 0;
    const inContact = contactRect.top < height && contactRect.bottom > 0;
    const visible = y < hero.offsetHeight || inWork || inContact;
    const mode = inWork ? "work" : inContact ? "contact" : "home";
    host.dataset.scene = mode;
    if (visible || dirty) {
      const wash = inWork ? 1 : 0;
      const mobile = width < 700;
      const phase = inContact ? Math.PI * 0.3 : heroRatio * 0.25;
      const distance = mobile ? 16.5 : 12.5;
      targetPosition.set(
        Math.sin(phase) * distance * 0.5 + currentPointer.x * 0.65,
        (inWork ? 5.5 : 4) +
          Math.sin(time * 0.17) * 0.075 +
          currentPointer.y * 0.35,
        Math.cos(phase) * distance + (inWork ? 2 : 0),
      );
      targetLook.set(inContact ? 1.3 : 0, inWork ? 1.0 : 1.65, 0);
      camera.position.lerp(targetPosition, enabled ? 0.045 : 1);
      look.lerp(targetLook, enabled ? 0.045 : 1);
      camera.lookAt(look);
      camera.rotation.z += enabled
        ? velocity * 0.005 + Math.sin(time * 0.11) * 0.002
        : 0;
      scene.background
        .copy(peach)
        .lerp(galleryColor, wash * 0.92)
        .lerp(eveningColor, mood * 0.8);
      scene.fog.color.copy(scene.background);
      water.material.uniforms.color.value
        .set(inWork ? "#dbe2df" : "#c4d6da")
        .lerp(eveningColor, mood * 0.5);
      sun.intensity = 4.2 - mood * 1.4;
      deformRibbon(mainRibbon, time);
      deformRibbon(echoRibbon, time * 0.85);
      rig.rotation.y = THREE.MathUtils.lerp(
        rig.rotation.y,
        Math.sin(time * 0.12) * 0.055 + (inWork ? 0.7 : 0),
        enabled ? 0.035 : 1,
      );
      rig.position.x = THREE.MathUtils.lerp(
        rig.position.x,
        inWork ? -3.5 : 0,
        enabled ? 0.035 : 1,
      );
      rig.position.y = THREE.MathUtils.lerp(
        rig.position.y,
        inWork ? -1.3 : -0.25,
        enabled ? 0.035 : 1,
      );
      paperFold.rotation.y = -0.5 + Math.sin(time * 0.2) * 0.07;
      finGroup.rotation.y = Math.sin(time * 0.2) * 0.055;
      ring.rotation.z = time * 0.18;
      floating.forEach(({ object, base, phase }) => {
        object.position.y = base.y + Math.sin(time * 0.6 + phase) * 0.22;
        object.rotation.y = time * 0.18 + phase;
        object.rotation.z = Math.sin(time * 0.45 + phase) * 0.2;
      });
      raycaster.setFromCamera(currentPointer, camera);
      if (raycaster.ray.intersectPlane(groundPlane, ripplePoint)) {
        water.material.uniforms.uRipple.value.set(
          ripplePoint.x,
          -ripplePoint.z,
        );
      }
      pointerStrength = THREE.MathUtils.lerp(
        pointerStrength,
        enabled ? Math.min(1, pointer.length() * 0.9) : 0,
        0.04,
      );
      water.material.uniforms.uStrength.value = pointerStrength;
      water.material.uniforms.uTime.value = time;
      renderer.clear();
      renderer.render(scene, camera);
      if (inWork) {
        previews.forEach((item) => {
          const rect = item.element.getBoundingClientRect();
          const article = item.element.closest("article");
          const shown =
            item.ready &&
            !article.hidden &&
            rect.bottom > -150 &&
            rect.top < height + 150;
          item.object.visible = shown;
          if (!shown) return;
          item.object.position.set(
            rect.left + rect.width / 2 - width / 2,
            height / 2 - rect.top - rect.height / 2,
            0,
          );
          item.object.scale.set(rect.width, rect.height, 1);
          item.uniforms.uPlaneSize.value.set(rect.width, rect.height);
          item.uniforms.uVelocity.value = velocity;
          item.uniforms.uMotion.value = enabled ? 1 : 0;
          item.uniforms.uTime.value = time;
          item.uniforms.uHover.value = THREE.MathUtils.lerp(
            item.uniforms.uHover.value,
            enabled ? item.hover : 0,
            0.1,
          );
          item.uniforms.uAlpha.value = Number(
            getComputedStyle(article).opacity,
          );
        });
        renderer.clearDepth();
        renderer.render(gallery, galleryCamera);
      }
      if (++renderCount % 30 === 0) host.dataset.frame = String(renderCount);
      dirty = false;
    }
    // The frame loop stops behind opaque chapters, in background tabs and when paused.
    if (enabled && visible) wake();
  }
  function onScroll() {
    dirty = true;
    wake();
  }
  function onPointer(event) {
    if (!enabled || event.pointerType === "touch") return;
    pointer.set(
      (event.clientX / width) * 2 - 1,
      -((event.clientY / height) * 2 - 1),
    );
    wake();
  }
  function onVisibility() {
    previousTime = 0;
    if (!document.hidden) {
      dirty = true;
      wake();
    }
  }
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove("webgl-ready");
    media.forEach((e) => e.classList.remove("webgl-media"));
    host.dataset.renderer = "fallback";
  });
  canvas.addEventListener("webglcontextrestored", () => {
    contextLost = false;
    dirty = true;
    root.classList.add("webgl-ready");
    previews
      .filter((p) => p.ready)
      .forEach((p) => p.element.classList.add("webgl-media"));
    host.dataset.renderer = "webgl";
    wake();
  });
  resize();
  root.classList.add("webgl-ready");
  host.dataset.renderer = "webgl";
  return {
    setMotion(value) {
      enabled = value;
      previousTime = 0;
      dirty = true;
      wake();
    },
    setMood(value) {
      targetMood = value ? 1 : 0;
      if (!enabled) mood = targetMood;
      dirty = true;
      wake();
    },
    refresh() {
      dirty = true;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        o.geometry?.dispose();
      });
      gallery.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      materials.forEach((m) => m.dispose());
      disposables.forEach((d) => d.dispose());
      shadow.material.dispose();
      water.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
