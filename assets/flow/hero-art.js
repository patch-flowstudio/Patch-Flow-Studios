import * as THREE from "./vendor/three.module.min.js";

// The original artwork, separated into a clean plate and a transparent satin layer.
// GPU deformation preserves its composition while allowing independent motion.
export function createHeroArt(wake) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const uniforms = {
    uPlate: { value: null },
    uRibbon: { value: null },
    uTime: { value: 0 },
    uMotion: { value: 1 },
    uMood: { value: 0 },
    uPortrait: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uPresence: { value: 0 },
    uEnergy: { value: 0 },
    uFrame: { value: new THREE.Vector2(1, 1) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uWakes: {
      value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, -100, 0)),
    },
  };
  const shared = `
    uniform float uTime, uMotion, uMood, uPresence, uEnergy, uPortrait;
    uniform vec2 uPointer, uFrame, uCenter;
    varying vec2 vUv;
    vec2 depthShift(vec2 uv) {
      float foreground=1.-smoothstep(.12,.65,uv.y);
      float sides=pow(abs(uv.x-.5)*2.,3.);
      return uPointer*vec2(.006,.003)*(0.25+foreground*.75+sides*.6)*uMotion;
    }
    vec3 lightMood(vec3 c) {
      return mix(c,c*vec3(.81,.80,.98)+vec3(.035,.018,.04),uMood*.7);
    }
  `;
  const backgroundMaterial = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader:
      "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }",
    fragmentShader:
      shared +
      `
      uniform sampler2D uPlate, uRibbon;
      uniform vec4 uWakes[12];
      void main() {
        vec2 uv=(vUv-.5)/uFrame+uCenter;
        uv+=depthShift(uv);
        float drape=(1.-smoothstep(.05,.37,uv.x))*smoothstep(.16,.42,uv.y);
        float pleats=smoothstep(.86,.94,uv.x)*(1.-smoothstep(.62,.78,uv.y))*smoothstep(.2,.4,uv.y);
        uv.x+=sin(uv.y*7.-uTime*.65)*.0028*drape*uMotion;
        uv.x+=sin(uv.y*10.+uTime*.55)*.0014*pleats*uMotion;
        float ground=1.-smoothstep(.16,.31,uv.y);
        vec2 bend=vec2(0.); float glow=0.;
        if(ground>.001 && uMotion>.001) for(int i=0;i<12;i++) {
          float age=uTime-uWakes[i].z;
          if(age<0. || age>4.) continue;
          vec2 delta=(vUv-uWakes[i].xy)*vec2(1.6,1.);
          float d=length(delta), front=d-age*.18;
          float ring=sin(front*130.)*exp(-front*front*900.)*exp(-age*1.1)*uWakes[i].w;
          bend+=delta/max(d,.001)*ring*.0035; glow+=ring*.024;
        }
        uv+=bend*ground*uMotion;
        vec3 c=texture2D(uPlate,clamp(uv,.001,.999)).rgb;
        // Portrait framing extends the existing sky, keeping the landscape at the foot.
        float sky=smoothstep(.8,1.,uv.y)*uPortrait;
        c=mix(c,texture2D(uPlate,vec2(.5,.98)).rgb,sky);
        float shadow=0.;
        if(ground>.001) {
        float envelope=pow(max(0.,sin(clamp(uv.x,0.,1.)*3.14159265)),1.6)
          *(1.-smoothstep(.74,.82,uv.x));
        vec2 pointerUv=uPointer*.5/uFrame+uCenter;
        vec2 delta=(uv-pointerUv)*vec2(1.5,1.);
        float influence=exp(-dot(delta,delta)*25.)*uPresence;
        float wave=sin(uv.x*13.-uTime*1.35)*.019+sin(uv.x*22.-uTime*.9)*.006;
        float lift=influence*(.018+uEnergy*.02);
        for(int i=-2;i<=2;i++) {
          vec2 shadowUv=uv+vec2(float(i)*.004,.012-(wave+lift)*envelope*uMotion);
          shadow+=texture2D(uRibbon,shadowUv).a*.022;
        }
        }
        c*=1.-shadow*ground;
        c+=clamp(glow,-.05,.05)*ground*uMotion;
        gl_FragColor=vec4(lightMood(c),1.);
        #include <colorspace_fragment>
      }
    `,
  });
  const ribbonMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader:
      shared +
      `
      varying float vGlint;
      void main() {
        vUv=uv;
        vec2 p=uv-depthShift(uv);
        // Settle before the column, not at the canvas edge, so every architectural
        // attachment stays fixed through the complete wave and pointer cycle.
        float envelope=pow(max(0.,sin(uv.x*3.14159265)),1.6)
          *(1.-smoothstep(.74,.82,uv.x));
        vec2 pointerUv=uPointer*.5/uFrame+uCenter;
        float influence=exp(-dot((uv-pointerUv)*vec2(1.5,1.),(uv-pointerUv)*vec2(1.5,1.))*25.)*uPresence;
        float wave=sin(uv.x*13.-uTime*1.35)*.019+sin(uv.x*22.-uTime*.9)*.006;
        float lift=influence*(.018+uEnergy*.02);
        p.y+=(wave+lift)*envelope*uMotion;
        p.x+=sin(uv.x*10.-uTime*.65)*.0025*envelope*uMotion;
        vGlint=(cos(uv.x*13.-uTime*1.35)*.035+influence*.055)*uMotion;
        gl_Position=vec4((p-uCenter)*uFrame*2.,0.,1.);
      }
    `,
    fragmentShader:
      shared +
      `
      uniform sampler2D uRibbon;
      varying float vGlint;
      void main() {
        vec4 c=texture2D(uRibbon,vUv);
        // Keep the original architectural occlusions at the two pinned right anchors.
        float pillar=smoothstep(.823,.826,vUv.x)*(1.-smoothstep(.858,.861,vUv.x))
          *smoothstep(.24,.244,vUv.y)*(1.-smoothstep(.531,.535,vUv.y));
        float facade=smoothstep(.896,.9,vUv.x)*smoothstep(.23,.234,vUv.y);
        c.a*=1.-max(pillar,facade);
        if(c.a<.003) discard;
        gl_FragColor=vec4(lightMood(c.rgb*(1.+vGlint)),c.a);
        #include <colorspace_fragment>
      }
    `,
  });
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    backgroundMaterial,
  );
  const ribbon = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 160, 72),
    ribbonMaterial,
  );
  // Ribbon coordinates are image UVs, so only its UVs are used by the vertex shader.
  background.frustumCulled = ribbon.frustumCulled = false;
  background.renderOrder = 0;
  ribbon.renderOrder = 1;
  scene.add(background, ribbon);
  const textures = [];
  let loaded = 0,
    disposed = false,
    wakeIndex = 0,
    lastWake = -1;
  [
    ["uPlate", "landscape-plate.webp"],
    ["uRibbon", "landscape-ribbon.webp"],
  ].forEach(([name, path]) => {
    new THREE.TextureLoader().load(
      new URL(path, import.meta.url).href,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        uniforms[name].value = texture;
        textures.push(texture);
        loaded++;
        wake();
      },
    );
  });
  return {
    get ready() {
      return loaded === 2;
    },
    resize(width, height) {
      const imageAspect = 1672 / 941;
      const portrait = width / height < 0.95;
      const artWidth = portrait
        ? width * 1.15
        : Math.max(width, height * imageAspect);
      const artHeight = artWidth / imageAspect;
      uniforms.uPortrait.value = portrait ? 1 : 0;
      uniforms.uFrame.value.set(artWidth / width, artHeight / height);
      uniforms.uCenter.value.set(
        0.5,
        portrait ? (height / artHeight) * 0.5 : 0.5,
      );
    },
    render(renderer, { time, enabled, pointer, presence, energy, mood }) {
      uniforms.uTime.value = time;
      uniforms.uMotion.value = enabled ? 1 : 0;
      uniforms.uPointer.value.copy(pointer);
      uniforms.uPresence.value = presence;
      uniforms.uEnergy.value = energy;
      uniforms.uMood.value = mood;
      if (enabled && energy > 0.03 && time - lastWake > 0.065) {
        uniforms.uWakes.value[wakeIndex].set(
          (pointer.x + 1) * 0.5,
          (pointer.y + 1) * 0.5,
          time,
          energy,
        );
        wakeIndex = (wakeIndex + 1) % 12;
        lastWake = time;
      }
      renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      [background, ribbon].forEach((object) => {
        object.geometry.dispose();
        object.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
    },
  };
}
