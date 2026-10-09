import * as THREE from "./vendor/three.module.min.js";
import { Reflector } from "./vendor/Reflector.js";
import { createHeroArt } from "./hero-art.js";

// Original geometry, materials and motion. No models or textures from the reference.
export function createWorld({ canvas, enabled = true }) {
  const root = document.documentElement;
  const host = canvas.parentElement;
  const hero = document.getElementById("top");
  const work = document.getElementById("work");
  const contact = document.getElementById("contact");
  const media = [...document.querySelectorAll(".project-media")];
  const workGrid = document.getElementById("work-grid");
  const headline = document.getElementById("hero-title");
  const titleInk = [...headline.querySelectorAll("i, .title-line:last-child")];
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

  renderer.autoClear = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e8dcd2");
  scene.fog = new THREE.Fog("#e8dcd2", 15, 42);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 90);
  const gallery = new THREE.Scene();
  const galleryCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);

  const pointer = new THREE.Vector2();
  const currentPointer = new THREE.Vector2();
  const pointerPixels = new THREE.Vector2(-1000, -1000);
  const currentPixels = pointerPixels.clone();
  const raycaster = new THREE.Raycaster();
  const ripplePoint = new THREE.Vector3();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let width = document.documentElement.clientWidth,
    height = innerHeight,
    raf = 0,
    time = 0,
    previousTime = 0;
  let mood = 0,
    targetMood = 0,
    renderCount = 0;
  let disposed = false,
    contextLost = false,
    dirty = true;
  let pointerEnergy = 0,
    pointerActive = false,
    pointerPresence = 0,
    wakeIndex = 0,
    lastWake = -1,
    wakeCount = 0;
  let visualScroll = scrollY,
    workBlend = 0,
    appliedLag = 0,
    layoutDirty = true;
  const layout = {};
  const wakes = Array.from(
    { length: 12 },
    () => new THREE.Vector4(0, 0, -100, 0),
  );
  const disposables = [];
  const peach = new THREE.Color("#e8dcd2");
  const galleryColor = new THREE.Color("#e9ece6");
  const eveningColor = new THREE.Color("#cec6dd");
  const heroArt = createHeroArt(() => {
    dirty = true;
    wake();
  });

  const waterShader = {
    uniforms: {
      color: { value: new THREE.Color("#cad9dc") },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      uTime: { value: 0 },
      uWakes: { value: wakes },
    },
    vertexShader:
      "uniform mat4 textureMatrix; varying vec4 vMirror; varying vec3 vPosition; void main(){ vPosition=position; vMirror=textureMatrix*vec4(position,1.); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: [
      "uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; uniform vec4 uWakes[12];",
      "varying vec4 vMirror; varying vec3 vPosition;",
      "void main(){",
      "vec2 uv=vMirror.xy/vMirror.w; vec2 p=vPosition.xy;",
      "float w1=sin(p.x*2.1+p.y*1.2+uTime*.75);",
      "float w2=sin(p.y*3.6-p.x*.7-uTime*1.1);",
      "vec2 bend=vec2(w1*.0014,w2*.0012); float light=0.;",
      "for(int i=0;i<12;i++){ vec2 delta=p-uWakes[i].xy; float age=max(0.,uTime-uWakes[i].z);",
      "if(age>4.) continue; float d=length(delta); float front=d-age*2.8;",
      "float ring=sin(front*8.)*exp(-front*front*1.6)*exp(-age*.85)*uWakes[i].w;",
      "bend+=delta/max(d,.1)*ring*.019; light+=ring*.12; }",
      "vec3 reflection=texture2D(tDiffuse,uv+bend).rgb;",
      "float silk=pow(.5+.5*sin(p.x*2.+p.y*3.4+uTime),14.);",
      "vec3 base=mix(color,reflection,.48)+silk*.016+clamp(light,-.14,.14);",
      "gl_FragColor=vec4(base,1.);",
      "#include <tonemapping_fragment>",
      "#include <colorspace_fragment>",
      "}",
    ].join("\n"),
  };
  const water = new Reflector(new THREE.PlaneGeometry(70, 70), {
    textureWidth: 768,
    textureHeight: 768,
    multisample: 0,
    clipBias: 0.005,
    shader: waterShader,
    color: "#cad9dc",
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.22;
  scene.add(water);
  const previewVertex = [
    "uniform float uTime; uniform float uMotion; uniform vec2 uViewport; uniform vec2 uPointer; uniform vec2 uFlow; uniform float uEnergy;",
    "varying vec2 vUv; varying float vDepth;",
    "void main(){ vUv=uv; vec4 p=modelMatrix*vec4(position,1.);",
    "float fabric=sin(uv.x*3.14159265)*sin(uv.y*3.14159265);",
    "p.z+=sin(uv.x*4.2+uv.y*2.5-uTime*1.2)*fabric*12.*uMotion;",
    "p.y+=sin(uv.x*3.2+uTime*.9)*fabric*2.2*uMotion;",
    "float start=uViewport.y*.13; float radius=uViewport.y*.44;",
    "float arc=clamp((p.y-start)/radius,0.,2.6)*uMotion;",
    "if(p.y>start){ p.y=mix(p.y,start+sin(arc)*radius,uMotion);",
    "p.z-=(1.-cos(arc))*radius*1.6;",
    "p.z+=sin(arc)*sin(arc*3.-uTime*.8+uv.x*2.6)*radius*.038*uMotion; }",
    "vec4 clip=projectionMatrix*viewMatrix*p; vec2 screen=(clip.xy/clip.w*.5+.5)*uViewport;",
    "float influence=exp(-dot(screen-uPointer,screen-uPointer)/22000.)*uMotion;",
    "p.xy+=uFlow*influence*7.; p.z+=influence*uEnergy*10.;",
    "vDepth=-p.z;",
    "gl_Position=projectionMatrix*viewMatrix*p; }",
  ].join("\n");
  const previewFragment = [
    "uniform sampler2D uImage; uniform vec2 uImageSize; uniform vec2 uPlaneSize; uniform vec2 uViewport; uniform float uHover;",
    "varying vec2 vUv; varying float vDepth;",
    "void main(){ vec2 uv=vUv; float i=uImageSize.x/uImageSize.y; float p=uPlaneSize.x/uPlaneSize.y;",
    "vec2 crop=i>p?vec2(p/i,1.):vec2(1.,i/p);",
    "uv=(uv-.5)*crop/(1.+uHover*.025)+.5;",
    "float alpha=1.-smoothstep(uViewport.y*.32,uViewport.y*1.05,vDepth);",
    "vec4 c=texture2D(uImage,uv); gl_FragColor=vec4(c.rgb,alpha);",
    "#include <colorspace_fragment>",
    "}",
  ].join("\n");
  const previews = media.map((element) => {
    const image = element.querySelector("img");
    const uniforms = {
      uImage: { value: null },
      uImageSize: { value: new THREE.Vector2(1600, 1000) },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uMotion: { value: enabled ? 1 : 0 },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2(-1000, -1000) },
      uFlow: { value: new THREE.Vector2() },
      uEnergy: { value: 0 },
      uViewport: { value: new THREE.Vector2(width, height) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: previewVertex,
      fragmentShader: previewFragment,
      transparent: true,
      depthTest: false,
    });
    const object = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 32, 40),
      material,
    );
    object.frustumCulled = false;
    gallery.add(object);
    const details = [element.parentElement.querySelector(".project-details")];
    const item = {
      element,
      image,
      details,
      object,
      uniforms,
      hover: 0,
      ready: false,
      layout: {},
    };
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

  // Layout reads are batched only when sizes change, never after frame writes.
  function measureLayout() {
    const y = scrollY;
    [hero, work, contact].forEach((element) => {
      const rect = element.getBoundingClientRect();
      layout[element.id] = { top: rect.top + y, height: rect.height };
    });
    previews.forEach((item) => {
      const rect = item.element.getBoundingClientRect();
      item.layout = {
        top: rect.top + y - appliedLag,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });
    layoutDirty = false;
  }
  const layoutObserver = new ResizeObserver(() => {
    layoutDirty = true;
    dirty = true;
    wake();
  });
  [
    hero,
    work,
    contact,
    ...media,
    ...previews.flatMap((p) => p.details),
  ].forEach((element) => layoutObserver.observe(element));
  document.fonts.ready.then(() => {
    if (disposed) return;
    layoutDirty = true;
    dirty = true;
    wake();
  });
  function resize() {
    width = document.documentElement.clientWidth;
    height = innerHeight;
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, width < 700 ? 1.25 : 1.5),
    );
    renderer.setSize(width, height, false);
    heroArt.resize(width, height);
    layoutDirty = true;
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
    const dt = Math.min((now - (previousTime || now - 16.67)) / 1000, 0.05);
    previousTime = now;
    const ease = (rate) => (enabled ? 1 - Math.exp(-rate * dt) : 1);
    if (enabled) time += dt;
    const y = scrollY;
    if (layoutDirty) measureLayout();
    const inkBounds =
      y < layout.top.height && enabled && pointerActive
        ? titleInk.map((ink) => ink.getBoundingClientRect())
        : null;
    currentPointer.lerp(enabled ? pointer : new THREE.Vector2(), ease(5.5));
    currentPixels.lerp(pointerPixels, ease(9));
    pointerPresence = THREE.MathUtils.lerp(
      pointerPresence,
      pointerActive && enabled ? 1 : 0,
      ease(5),
    );
    pointerEnergy *= Math.exp(-dt * 2.5);
    mood = THREE.MathUtils.lerp(mood, targetMood, ease(3));
    const inWork =
      layout.work.top - y < height && layout.work.top + layout.work.height > y;
    const inContact =
      layout.contact.top - y < height &&
      layout.contact.top + layout.contact.height > y;
    const heroRatio = THREE.MathUtils.clamp(y / layout.top.height, 0, 1);
    const visible = y < layout.top.height || inWork || inContact;
    const mode = inWork ? "work" : inContact ? "contact" : "home";
    host.dataset.scene = mode;
    workBlend = THREE.MathUtils.lerp(workBlend, inWork ? 1 : 0, ease(3));
    visualScroll =
      enabled && inWork ? THREE.MathUtils.lerp(visualScroll, y, ease(9)) : y;
    const lag = enabled ? THREE.MathUtils.clamp(y - visualScroll, -42, 42) : 0;
    appliedLag = lag;
    workGrid.style.transform = lag
      ? "translate3d(0," + lag.toFixed(2) + "px,0)"
      : "";
    if (visible || dirty) {
      const wash = workBlend;
      const mobile = width < 700;
      const phase =
        (inContact ? 0.24 : heroRatio * 0.1) + currentPointer.x * 0.12;
      const distance = mobile ? 17 : 13;
      targetPosition.set(
        Math.sin(phase) * distance,
        4.5 +
          workBlend * 0.8 +
          Math.sin(time * 0.17) * 0.025 +
          currentPointer.y * 0.45,
        Math.cos(phase) * distance + workBlend * 2,
      );
      targetLook.set(inContact ? 0.6 : 0, mobile ? 2.3 : 2.15, -0.8);
      camera.position.lerp(targetPosition, ease(6));
      look.lerp(targetLook, ease(6));
      camera.lookAt(look);
      scene.background
        .copy(peach)
        .lerp(galleryColor, wash * 0.92)
        .lerp(eveningColor, mood * 0.8);
      scene.fog.color.copy(scene.background);
      water.material.uniforms.color.value
        .set(inWork ? "#dbe2df" : "#c4d6da")
        .lerp(eveningColor, mood * 0.5);
      raycaster.setFromCamera(currentPointer, camera);
      if (raycaster.ray.intersectPlane(groundPlane, ripplePoint)) {
        if (
          enabled &&
          pointerEnergy > 0.03 &&
          time - lastWake > 0.065 &&
          Math.abs(ripplePoint.x) < 22 &&
          Math.abs(ripplePoint.z) < 22
        ) {
          wakes[wakeIndex].set(
            ripplePoint.x,
            -ripplePoint.z,
            time,
            Math.min(0.85, pointerEnergy),
          );
          wakeIndex = (wakeIndex + 1) % wakes.length;
          lastWake = time;
          host.dataset.wakes = String(++wakeCount);
        }
      }
      if (inkBounds) {
        titleInk.forEach((ink, i) => {
          const bounds = inkBounds[i];
          ink.style.setProperty(
            "--light-x",
            (currentPixels.x - bounds.left).toFixed(1) + "px",
          );
          ink.style.setProperty(
            "--light-y",
            (currentPixels.y - bounds.top).toFixed(1) + "px",
          );
        });
      } else {
        titleInk.forEach((ink) => {
          ink.style.removeProperty("--light-x");
          ink.style.removeProperty("--light-y");
        });
      }
      water.material.uniforms.uTime.value = time;
      renderer.clear();
      if (!inWork && heroArt.ready) {
        heroArt.render(renderer, {
          time,
          enabled,
          pointer: currentPointer,
          presence: pointerPresence,
          energy: pointerEnergy,
          mood,
        });
        host.dataset.hero = "layered-art";
      } else {
        renderer.render(scene, camera);
      }
      if (heroArt.ready || inWork) root.classList.add("webgl-ready");
      if (inWork) {
        previews.forEach((item) => {
          const box = item.layout;
          const rect = {
            ...box,
            top: box.top - y + lag,
            bottom: box.top - y + lag + box.height,
          };
          const article = item.element.closest("article");
          const shown =
            item.ready &&
            !article.hidden &&
            rect.bottom > -height * 0.9 &&
            rect.top < height + 100;
          item.object.visible = shown;
          if (!shown) {
            item.details[0].style.transform = "";
            item.details[0].style.opacity = "";
            return;
          }
          item.object.position.set(
            rect.left + rect.width / 2 - width / 2,
            height / 2 - rect.top - rect.height / 2,
            0,
          );
          item.object.scale.set(rect.width, rect.height, 1);
          item.uniforms.uPlaneSize.value.set(rect.width, rect.height);
          item.uniforms.uMotion.value = enabled ? 1 : 0;
          item.uniforms.uTime.value = time;
          item.uniforms.uPointer.value.set(
            currentPixels.x,
            height - currentPixels.y,
          );
          item.uniforms.uFlow.value.set(
            THREE.MathUtils.clamp((pointer.x - currentPointer.x) * 6, -1, 1),
            THREE.MathUtils.clamp((pointer.y - currentPointer.y) * 6, -1, 1),
          );
          item.uniforms.uEnergy.value = enabled ? pointerEnergy : 0;
          item.uniforms.uHover.value = THREE.MathUtils.lerp(
            item.uniforms.uHover.value,
            enabled ? item.hover : 0,
            ease(4),
          );
          // One rigid, readable caption follows the media's lower edge. It fades
          // before the sheet turns away, avoiding tangent flattening and text jumps.
          const bottom = rect.top + rect.height;
          const originalY = height / 2 - bottom;
          const start = height * 0.13,
            radius = height * 0.44;
          const arc = enabled
            ? THREE.MathUtils.clamp((originalY - start) / radius, 0, 2.6)
            : 0;
          const curvedY = arc ? start + Math.sin(arc) * radius : originalY;
          const depth = (1 - Math.cos(arc)) * radius * 1.6;
          const scale =
            galleryCamera.position.z / (galleryCamera.position.z + depth);
          const dx = (rect.left + rect.width / 2 - width / 2) * (scale - 1);
          const dy = height / 2 - curvedY * scale - bottom;
          const detail = item.details[0];
          detail.style.transform = arc
            ? `translate3d(${dx.toFixed(3)}px,${dy.toFixed(3)}px,0) scale(${scale.toFixed(5)})`
            : "";
          detail.style.opacity = arc
            ? String(1 - THREE.MathUtils.smoothstep(arc, 0.35, 1.05))
            : "";
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
    const x = (event.clientX / width) * 2 - 1,
      y = -((event.clientY / height) * 2 - 1);
    pointerEnergy = Math.min(
      1,
      pointerEnergy + Math.hypot(x - pointer.x, y - pointer.y) * 3,
    );
    pointer.set(x, y);
    pointerPixels.set(event.clientX, event.clientY);
    pointerActive = true;
    wake();
  }
  function onPointerLeave() {
    pointerActive = false;
    pointer.set(0, 0);
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
  document.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove("webgl-ready");
    media.forEach((e) => e.classList.remove("webgl-media"));
    workGrid.style.transform = "";
    appliedLag = 0;
    previews.forEach((p) =>
      p.details.forEach((d) => {
        d.style.transform = "";
        d.style.opacity = "";
      }),
    );
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
  host.dataset.renderer = "webgl";
  return {
    setMotion(value) {
      enabled = value;
      if (!enabled) {
        workGrid.style.transform = "";
        appliedLag = 0;
        previews.forEach((p) =>
          p.details.forEach((d) => {
            d.style.transform = "";
            d.style.opacity = "";
          }),
        );
      }
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
      layoutDirty = true;
      dirty = true;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      layoutObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        o.geometry?.dispose();
      });
      gallery.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      disposables.forEach((d) => d.dispose());
      water.dispose();
      heroArt.dispose();
      renderer.dispose();
    },
  };
}
