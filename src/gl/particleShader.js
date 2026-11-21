import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aRand;
  uniform float uTime;
  uniform float uMix;
  uniform float uSize;
  uniform float uPixel;
  uniform vec3 uMouse;
  uniform float uMouseOn;
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uHot;
  uniform float uBurst;
  uniform float uNear;
  uniform float uFar;
  varying vec3 vCol;
  varying float vAlpha;

  void main() {
    float start = aRand.x * 0.42;
    float m = smoothstep(start, start + 0.58, uMix);
    vec3 p = mix(aFrom, aTo, m);

    float burst = sin(m * 3.14159265);
    p += (aRand.yzw - 0.5) * burst * uBurst;

    float t = uTime;
    p += 0.045 * vec3(
      sin(t * 0.7 + aRand.y * 40.0),
      cos(t * 0.6 + aRand.z * 40.0),
      sin(t * 0.5 + aRand.w * 40.0)
    );

    vec3 world = (modelMatrix * vec4(p, 1.0)).xyz;
    vec2 away = world.xy - uMouse.xy;
    float dist = length(away);
    float push = smoothstep(1.5, 0.0, dist) * uMouseOn;
    world += vec3(normalize(away + 0.0001), 0.35) * push * 0.55;

    vec4 mv = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;

    float node = step(0.993, aRand.w);
    float depth = smoothstep(uFar, uNear, -mv.z);
    float size = uSize * (0.55 + aRand.w * 0.75) * (1.0 + node * 2.0) * (1.0 + push * 1.2) * (0.7 + depth * 0.6);
    gl_PointSize = clamp(size * uPixel / -mv.z, uPixel, 6.5 * uPixel);

    float tone = smoothstep(-2.4, 2.4, p.y + p.x * 0.45);
    vec3 col = mix(uColA, uColB, tone);
    float hot = step(0.972, aRand.w) * 0.8 + node;
    vCol = mix(col, uHot, clamp(hot, 0.0, 1.0));
    vAlpha = mix(0.5, 0.95, aRand.z) * (1.0 + push * 0.6) * (0.28 + depth * 0.72);
  }
`;

const FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vCol;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(vCol, a * vAlpha * uOpacity);
  }
`;

const THEMES = {
  light: {
    a: new THREE.Color('#14173a'),
    b: new THREE.Color('#3b3bff'),
    hot: new THREE.Color('#ff4d2e'),
    blending: THREE.NormalBlending,
  },
  dark: {
    a: new THREE.Color('#4fe3d0'),
    b: new THREE.Color('#8b7bff'),
    hot: new THREE.Color('#ff8a6b'),
    blending: THREE.AdditiveBlending,
  },
};

export { VERT as PARTICLE_VERT, FRAG as PARTICLE_FRAG, THEMES as PARTICLE_THEMES };
