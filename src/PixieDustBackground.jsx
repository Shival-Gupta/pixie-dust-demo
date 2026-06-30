import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float time;
uniform vec3 backColor;
uniform vec3 frontColor;
uniform sampler2D grainTex;
uniform sampler2D blurTex;
uniform float param1;
uniform float param2;
uniform float param3;
uniform float style;

varying vec2 vUv;

#define PI 3.141592653589793

//
// Simplex noise (Ashima Arts)
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float snoise01(vec2 v) { return (1.0 + snoise(v)) * 0.5; }

float noise2d(vec2 st) {
  return snoise01(vec2(st.x + time * 0.02, st.y - time * 0.04));
}

float pattern(vec2 p) {
  vec2 q = vec2(noise2d(p + vec2(0.0, 0.0)), noise2d(p + vec2(5.2, 1.3)));
  vec2 r = vec2(noise2d(p + 4.0 * q + vec2(1.7, 9.2)), noise2d(p + 4.0 * q + vec2(8.3, 2.8)));
  return noise2d(p + 1.0 * r);
}

void main() {
  vec2 uv = vUv;
  vec2 p = gl_FragCoord.xy;

  uv = style > 0.0 ? ceil(uv * 50.0) / 50.0 : uv;

  // textures
  vec3 grainColor = texture2D(grainTex, mod(p * param1 * 5.0, 1024.0) / 1024.0).rgb;
  float blurAlpha = texture2D(blurTex, uv).a;

  float gr = pow(grainColor.r * 1.0, 1.5) + 0.5 * (1.0 - blurAlpha);
  float gg = grainColor.g;

  float ax = param2 * gr * cos(gg * 2.0 * PI);
  float ay = param2 * gr * sin(gg * 2.0 * PI);

  // noise
  float ndx = 1.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float ndy = 2.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float nx = uv.x * ndx + ax;
  float ny = uv.y * ndy + ay;
  float n = pattern(vec2(nx, ny));
  n = pow(n * 1.05, 6.0);
  n = smoothstep(0.0, 1.0, n);

  vec3 result = mix(backColor, frontColor, n);

  gl_FragColor = vec4(result, blurAlpha);
}
`;

// Generate a grain noise texture procedurally
function createGrainTexture() {
  const size = 512;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;
    data[i * 4 + 0] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Create a radial-gradient blur texture (creates the "planet" falloff)
function createBlurTexture() {
  const size = 512;
  const data = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = (y - cy) * 1.5; // slight vertical stretch
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      // Smooth falloff: bright in center, dark at edges
      const alpha = 1.0 - smoothstep(0.15, 0.85, dist);
      const idx = (y * size + x) * 4;
      data[idx + 0] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function PixieDustBackground({ darkMode = true }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Textures
    const grainTex = createGrainTexture();
    const blurTex = createBlurTexture();

    // Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        backColor: { value: new THREE.Color(0.05, 0.05, 0.05) },
        frontColor: { value: new THREE.Color(0.55, 0.55, 0.55) },
        grainTex: { value: grainTex },
        blurTex: { value: blurTex },
        param1: { value: 1.0 },
        param2: { value: 0.05 },
        param3: { value: 0.2 },
        style: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    // Mesh - plane slightly larger than viewport, offset to create off-center "planet" feel
    const geometry = new THREE.PlaneGeometry(3, 3);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -0.8;
    mesh.position.y = -0.5;
    mesh.position.z = 1;
    scene.add(mesh);

    sceneRef.current = { scene, camera, renderer, material, mesh };

    // Animation
    let animFrame;
    const startTime = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      material.uniforms.time.value = elapsed;
      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      grainTex.dispose();
      blurTex.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update colors when theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { material } = sceneRef.current;
    if (darkMode) {
      material.uniforms.backColor.value.set(0.05, 0.05, 0.05);
      material.uniforms.frontColor.value.set(0.55, 0.55, 0.55);
    } else {
      material.uniforms.backColor.value.set(0.9, 0.9, 0.9);
      material.uniforms.frontColor.value.set(0.45, 0.45, 0.45);
    }
  }, [darkMode]);

  return (
    <div
      ref={containerRef}
      id="Background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
