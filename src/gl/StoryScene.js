import * as THREE from 'three';
import { buildRandom, buildStoryShapes, orbitPoint } from './shapes';
import { PARTICLE_FRAG, PARTICLE_THEMES, PARTICLE_VERT } from './particleShader';

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

const NODE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixel;
  varying vec3 vCol;
  varying float vA;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixel / -mv.z, 1.5 * uPixel, 46.0 * uPixel);
    vCol = aColor;
    vA = aAlpha;
  }
`;

const NODE_FRAG = /* glsl */ `
  varying vec3 vCol;
  varying float vA;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.30, 0.24, d);
    float ring = smoothstep(0.5, 0.40, d) - smoothstep(0.40, 0.30, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.22;
    float a = (core + ring * 0.55 + halo) * vA;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vCol, a);
  }
`;

const EDGE_VERT = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute float aSide;
  attribute float aEnd;
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aGrow;
  uniform vec2 uViewport;
  uniform float uWidth;
  varying vec3 vCol;
  varying float vA;
  varying float vT;
  varying float vG;

  void main() {
    mat4 mvp = projectionMatrix * modelViewMatrix;
    vec4 a = mvp * vec4(aA, 1.0);
    vec4 b = mvp * vec4(aB, 1.0);
    vec2 hv = uViewport * 0.5;
    vec2 sa = a.xy / a.w * hv;
    vec2 sb = b.xy / b.w * hv;
    vec2 dir = normalize(sb - sa + vec2(1e-5));
    vec2 n = vec2(-dir.y, dir.x);
    vec4 p = mix(a, b, aEnd);
    vec2 sp = p.xy / p.w * hv + n * aSide * uWidth * 0.5;
    gl_Position = vec4(sp / hv * p.w, p.z, p.w);
    vCol = aColor;
    vA = aAlpha;
    vT = aEnd;
    vG = aGrow;
  }
`;

const EDGE_FRAG = /* glsl */ `
  varying vec3 vCol;
  varying float vA;
  varying float vT;
  varying float vG;

  void main() {
    if (vT > vG + 0.002) discard;
    gl_FragColor = vec4(vCol, vA);
  }
`;

const PALETTES = {
  light: { ink: '#1b1d2e', accent: '#3b3bff', a: '#14173a', hot: '#ff4d2e', muted: '#6a6e80', edge: '#4a4e68' },
  dark: { ink: '#e8eaf5', accent: '#8b7bff', a: '#4fe3d0', hot: '#ff8a6b', muted: '#9aa0b4', edge: '#9aa0c0' },
};
const PALETTE_KEYS = Object.keys(PALETTES.light);

const SKY = { form: 'cosmos', shift: 0, o: 0.24, oLight: 0.065, tilt: 0.88, rock: 0, still: 0, radius: 9.5, pad: 0, wide: 1 };
const HUB = { form: 'galaxy', shift: 1, o: 0.55, tilt: 0.95, rock: 1, still: 0, radius: 4.4, pad: 210 };
const BRAIN = { form: 'brain', shift: 1, o: 0.95, tilt: 0, rock: 1, still: 0, radius: 4.6, pad: 0 };
const ORBITS = { form: 'orbits', shift: 1, o: 0.85, tilt: 0.35, rock: 1, still: 0, radius: 5.0, pad: 0 };

const STAGES = [
  { form: 'sphere', shift: 0.7, o: 1, tilt: 0, rock: 0, still: 0, radius: 5.1, pad: 0 },
  SKY,
  SKY,
  SKY,
  HUB,
  BRAIN,
  ORBITS,
  { form: 'sealed', shift: 1, o: 0.85, tilt: 0, rock: 0, still: 0, radius: 5.5, pad: 0 },
  SKY,
  SKY,
];

const STAGE = { connect: [4, 4], gateway: [6, 6] };

const NODE_SCALE = 1.3;
const RADIUS = 4.2;
const CONNECTORS = 16;
const GROUP_COLOR = ['hot', 'accent', 'a', 'muted'];
const TENANTS = 6;
const LABEL_LEFT = new Set(['MongoDB', 'MITRE ATT&CK']);
const CONNECTOR_NAMES = [
  'CrowdStrike', 'AWS CloudTrail', 'ClickHouse', 'Jira',
  'Splunk', 'BigQuery', 'Elasticsearch', 'ServiceNow',
  'MITRE ATT&CK', 'Azure Activity', 'Neo4j', 'Slack',
  'Nuclei', 'IBM Activity', 'MongoDB', 'GitHub',
];

function direction(i, n) {
  const y = 1 - ((i + 0.5) / n) * 2;
  const r = Math.sqrt(1 - y * y);
  const a = i * Math.PI * (3 - Math.sqrt(5));
  return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
}

const span = (g, a, b, c, d) => smooth(a, b, g) * (1 - smooth(c, d, g));
const at = (g, [first, last]) => span(g, first - 0.15, first + 0.3, last + 0.78, last + 1);

export class StoryScene {
  constructor(canvas, { count, labelHost }) {
    this.labelHost = labelHost;
    this.target = 0;
    this.dimTarget = 1;
    this.graphDim = 1;
    this.g = 0;
    this.primed = false;
    this.time = 0;
    this.last = 0;
    this.running = false;
    this.frame = 0;
    this.sizeKey = '';
    this.compact = false;
    this.bound = -1;
    this.pointer = new THREE.Vector2();
    this.pointerSmooth = new THREE.Vector2();
    this.pointerOn = 0;
    this.pointerActive = false;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
    this.scene = new THREE.Scene();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.ray = new THREE.Raycaster();
    this.hit = new THREE.Vector3();

    this.themeName = 'light';
    this.palette = {};
    this.targetColors = {};
    this.tmpNode = new THREE.Color();
    this.tmpEdge = new THREE.Color();
    for (const key of PALETTE_KEYS) this.palette[key] = new THREE.Color(PALETTES.light[key]);

    this.form = new THREE.Group();
    this.scene.add(this.form);
    this.buildParticles(count);
    this.buildMovers();
    this.buildGraph();
    this.buildLabels();
    this.setTheme('light');
    this.resize();
    this.tick = this.tick.bind(this);
  }

  buildParticles(count) {
    const shapes = buildStoryShapes(count);
    this.shapeAttrs = {};
    for (const key of Object.keys(shapes)) this.shapeAttrs[key] = new THREE.BufferAttribute(shapes[key], 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', this.shapeAttrs.sphere);
    geometry.setAttribute('aFrom', this.shapeAttrs.sphere);
    geometry.setAttribute('aTo', this.shapeAttrs.galaxy);
    geometry.setAttribute('aRand', new THREE.BufferAttribute(buildRandom(count), 4));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
    const theme = PARTICLE_THEMES.light;
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: theme.blending,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uSize: { value: 44 },
        uPixel: { value: 1 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseOn: { value: 0 },
        uOpacity: { value: 1 },
        uColA: { value: theme.a.clone() },
        uColB: { value: theme.b.clone() },
        uHot: { value: theme.hot.clone() },
        uBurst: { value: 1 },
        uNear: { value: 14 },
        uFar: { value: 24 },
      },
    });
    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.particles.frustumCulled = false;
    this.form.add(this.particles);
  }

  bindStage(i) {
    if (i === this.bound) return;
    this.bound = i;
    const geometry = this.particles.geometry;
    geometry.setAttribute('aFrom', this.shapeAttrs[STAGES[i].form]);
    geometry.setAttribute('aTo', this.shapeAttrs[STAGES[i + 1].form]);
  }

  buildMovers() {
    const total = TENANTS;
    this.moverPos = new Float32Array(total * 3);
    this.moverSize = new Float32Array(total);
    this.moverAlpha = new Float32Array(total);
    this.moverColor = new Float32Array(total * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.moverPos, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(this.moverSize, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.moverAlpha, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(this.moverColor, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
    this.nodeMaterial = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uPixel: { value: 1 } },
    });
    this.moverPoints = new THREE.Points(geometry, this.nodeMaterial);
    this.moverPoints.frustumCulled = false;
    this.form.add(this.moverPoints);
  }

  buildGraph() {
    const nodes = [];
    const add = (pos, color, size) => {
      nodes.push({ pos, color, size });
      return nodes.length - 1;
    };

    this.agent = add(new THREE.Vector3(0, 0, 0), 'accent', 230);
    this.conn = [];
    for (let i = 0; i < CONNECTORS; i++) {
      this.conn.push(add(direction(i, CONNECTORS).multiplyScalar(RADIUS), GROUP_COLOR[i % 4], 100));
    }
    this.nodes = nodes;

    const edges = [];
    const link = (a, b) => edges.push({ a, b });
    this.spokes = [];
    for (let i = 0; i < CONNECTORS; i++) {
      this.spokes.push(edges.length);
      link(this.agent, this.conn[i]);
    }
    this.edges = edges;

    const nodeGeometry = new THREE.BufferGeometry();
    const nodePos = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => n.pos.toArray(nodePos, i * 3));
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    this.nodeSize = new Float32Array(nodes.length);
    this.nodeAlpha = new Float32Array(nodes.length);
    this.nodeColor = new Float32Array(nodes.length * 3);
    nodeGeometry.setAttribute('aSize', new THREE.BufferAttribute(this.nodeSize, 1));
    nodeGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.nodeAlpha, 1));
    nodeGeometry.setAttribute('aColor', new THREE.BufferAttribute(this.nodeColor, 3));
    nodeGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    this.nodePoints = new THREE.Points(nodeGeometry, this.nodeMaterial);
    this.nodePoints.frustumCulled = false;

    const edgeGeometry = new THREE.BufferGeometry();
    const E = edges.length;
    const ePos = new Float32Array(E * 12);
    const eA = new Float32Array(E * 12);
    const eB = new Float32Array(E * 12);
    const eSide = new Float32Array(E * 4);
    const eEnd = new Float32Array(E * 4);
    const eIndex = new Uint16Array(E * 6);
    const SIDES = [-1, 1, -1, 1];
    const ENDS = [0, 0, 1, 1];
    edges.forEach((e, i) => {
      for (let v = 0; v < 4; v++) {
        const at = (i * 4 + v) * 3;
        nodes[e.a].pos.toArray(eA, at);
        nodes[e.a].pos.toArray(ePos, at);
        nodes[e.b].pos.toArray(eB, at);
        eSide[i * 4 + v] = SIDES[v];
        eEnd[i * 4 + v] = ENDS[v];
      }
      [0, 1, 2, 1, 3, 2].forEach((k, n) => {
        eIndex[i * 6 + n] = i * 4 + k;
      });
    });
    this.edgeGrow = new Float32Array(E * 4);
    this.edgeAlpha = new Float32Array(E * 4);
    this.edgeColor = new Float32Array(E * 12);
    edgeGeometry.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    edgeGeometry.setAttribute('aA', new THREE.BufferAttribute(eA, 3));
    edgeGeometry.setAttribute('aB', new THREE.BufferAttribute(eB, 3));
    edgeGeometry.setAttribute('aSide', new THREE.BufferAttribute(eSide, 1));
    edgeGeometry.setAttribute('aEnd', new THREE.BufferAttribute(eEnd, 1));
    edgeGeometry.setAttribute('aGrow', new THREE.BufferAttribute(this.edgeGrow, 1));
    edgeGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.edgeAlpha, 1));
    edgeGeometry.setAttribute('aColor', new THREE.BufferAttribute(this.edgeColor, 3));
    edgeGeometry.setIndex(new THREE.BufferAttribute(eIndex, 1));
    edgeGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    this.edgeMaterial = new THREE.ShaderMaterial({
      vertexShader: EDGE_VERT,
      fragmentShader: EDGE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uViewport: { value: new THREE.Vector2(1, 1) }, uWidth: { value: 1.6 } },
    });
    this.edgeLines = new THREE.Mesh(edgeGeometry, this.edgeMaterial);
    this.edgeLines.frustumCulled = false;

    const packetCount = 22;
    this.packets = [];
    for (let i = 0; i < packetCount; i++) {
      this.packets.push({ edge: this.spokes[i % CONNECTORS], reverse: i % 2 === 1, phase: (i * 0.173) % 1, speed: 0.16 + 0.05 * (i % 3) });
    }
    const packetGeometry = new THREE.BufferGeometry();
    this.packetPos = new Float32Array(packetCount * 3);
    this.packetSize = new Float32Array(packetCount).fill(56);
    this.packetAlpha = new Float32Array(packetCount);
    this.packetColor = new Float32Array(packetCount * 3);
    packetGeometry.setAttribute('position', new THREE.BufferAttribute(this.packetPos, 3));
    packetGeometry.setAttribute('aSize', new THREE.BufferAttribute(this.packetSize, 1));
    packetGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.packetAlpha, 1));
    packetGeometry.setAttribute('aColor', new THREE.BufferAttribute(this.packetColor, 3));
    packetGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    this.packetPoints = new THREE.Points(packetGeometry, this.nodeMaterial);
    this.packetPoints.frustumCulled = false;

    this.scene.add(this.edgeLines, this.nodePoints, this.packetPoints);
  }

  buildLabels() {
    this.labels = [];
    if (!this.labelHost) return;
    const make = (node, text, show, flag = false) => {
      const el = document.createElement('span');
      el.className = 'glabel';
      el.textContent = text;
      if (LABEL_LEFT.has(text)) el.classList.add('is-left');
      this.labelHost.appendChild(el);
      this.labels.push({ el, node, show, flag });
    };
    const connect = (g) => at(g, STAGE.connect);
    this.conn.forEach((n, i) => make(n, CONNECTOR_NAMES[i], connect));
    make(this.agent, 'Agent', connect);
    make(this.agent, 'Gateway', (g) => at(g, STAGE.gateway));
  }

  updateLabels() {
    if (!this.labelHost) return;
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    const v = this.labelVec ?? (this.labelVec = new THREE.Vector3());
    for (const label of this.labels) {
      v.copy(this.nodes[label.node].pos).project(this.camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      const opacity = visible && !this.compact ? label.show(this.g) : 0;
      label.el.style.opacity = opacity.toFixed(3);
      label.el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px, 0)`;
    }
  }

  setTheme(name) {
    this.themeName = name === 'dark' ? 'dark' : 'light';
    for (const key of PALETTE_KEYS) this.targetColors[key] = new THREE.Color(PALETTES[this.themeName][key]);
    const blending = PARTICLE_THEMES[this.themeName].blending;
    for (const m of [this.particleMaterial, this.nodeMaterial, this.edgeMaterial]) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    this.particleTheme = PARTICLE_THEMES[this.themeName];
  }

  setProgress(g, dim = 1) {
    this.target = g;
    this.dimTarget = dim;
    if (!this.primed) {
      this.g = g;
      this.graphDim = dim;
      this.primed = true;
    }
  }

  setPointer(x, y, active) {
    this.pointer.set(x, y);
    this.pointerActive = active;
  }

  resize() {
    const w = this.renderer.domElement.clientWidth || window.innerWidth;
    const h = this.renderer.domElement.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const key = `${w}x${h}@${dpr}`;
    if (key === this.sizeKey) return;
    this.sizeKey = key;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.particleMaterial.uniforms.uPixel.value = dpr;
    this.nodeMaterial.uniforms.uPixel.value = dpr;
    this.edgeMaterial.uniforms.uViewport.value.set(w * dpr, h * dpr);
    this.edgeMaterial.uniforms.uWidth.value = 1.6 * dpr;
    this.compact = w < 1100 || w / h < 0.95;
    const edge = Math.min(Math.max(24, w * 0.04), 72);
    const left = Math.max(edge, (w - 1560) / 2) + 544 + 36;
    const right = w - 100;
    const room = this.compact ? w * 0.5 : Math.max((right - left) / 2, 160);
    this.centre = this.compact ? w / 2 : (left + right) / 2;
    this.room = room;
    this.size = [w, h];
  }

  updateCamera(weight, radius, pad, wide, t) {
    const [w, h] = this.size;
    const lift = this.compact ? -1.2 : 0.1;
    const unit = h * 1.3735;
    const across = (unit * 2 * radius) / (2 * this.room - pad);
    const down = (unit * radius) / (h / 2 - 110);
    const reach = (unit * radius) / (w * 0.54);
    const dz = lerp(Math.min(Math.max(across, down, 15), 34), Math.min(reach, 70), wide);
    const x = this.compact ? 0 : (-weight * (this.centre - w / 2)) / ((h * 1.3735) / dz);
    const sway = Math.sin(t * 0.15) * 0.1 + this.pointerSmooth.x * 0.08;
    this.camera.position.set(x + Math.sin(sway) * dz + this.pointerSmooth.x * 0.2, 0.8 - lift + this.pointerSmooth.y * 0.15, Math.cos(sway) * dz);
    this.camera.lookAt(x, -lift, 0);
    this.camera.updateMatrixWorld();
  }

  step(dt) {
    this.g += (this.target - this.g) * (1 - Math.exp(-dt * 2.6));
    this.graphDim += (this.dimTarget - this.graphDim) * (1 - Math.exp(-dt * 3.2));
    const g = this.g;
    const t = this.time;

    for (const key of PALETTE_KEYS) this.palette[key].lerp(this.targetColors[key], 1 - Math.exp(-dt * 5));
    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-dt * 5));
    this.pointerOn += ((this.pointerActive ? 1 : 0) - this.pointerOn) * (1 - Math.exp(-dt * 6));

    const stage = Math.min(Math.max(Math.floor(g), 0), STAGES.length - 2);
    const blend = smooth(0.35, 1, g - stage);
    this.bindStage(stage);
    const from = STAGES[stage];
    const to = STAGES[stage + 1];
    const shift = lerp(from.shift, to.shift, blend);

    const main = at(g, STAGE.connect);
    const tenants = at(g, STAGE.gateway);
    const boost = this.themeName === 'dark' ? 1.45 : 1;
    const dim = this.graphDim * (this.compact ? 0.4 : 1);

    const a = new Array(this.nodes.length).fill(0);
    const sizeMul = new Array(this.nodes.length).fill(1);
    const connAlpha = [];
    a[this.agent] = Math.max(main, tenants);
    sizeMul[this.agent] = 1 + 0.07 * Math.sin(t * 2);
    this.conn.forEach((n, i) => {
      connAlpha[i] = smooth(3.8 + 0.02 * i, 4.15 + 0.02 * i, g) * (1 - smooth(4.78, 5.0, g));
      a[n] = connAlpha[i];
    });

    const pal = this.palette;
    const tmp = this.tmpNode;
    this.nodes.forEach((n, i) => {
      tmp.copy(pal[n.color]);
      tmp.toArray(this.nodeColor, i * 3);
      this.nodeSize[i] = n.size * sizeMul[i] * NODE_SCALE;
      this.nodeAlpha[i] = Math.min(1, a[i] * dim * 0.95 * boost);
    });
    const ng = this.nodePoints.geometry.attributes;
    ng.aSize.needsUpdate = true;
    ng.aAlpha.needsUpdate = true;
    ng.aColor.needsUpdate = true;

    const setEdge = (idx, grow, alpha, color) => {
      for (let v = 0; v < 4; v++) {
        this.edgeGrow[idx * 4 + v] = grow;
        this.edgeAlpha[idx * 4 + v] = Math.min(1, alpha * boost);
        color.toArray(this.edgeColor, (idx * 4 + v) * 3);
      }
    };
    const edgeColor = this.tmpEdge;
    this.spokes.forEach((e, i) => {
      edgeColor.copy(pal.edge);
      setEdge(e, connAlpha[i], lerp(0.3, 0.6, smooth(4.2, 4.5, g)) * dim * (1 - smooth(4.78, 5.0, g)), edgeColor);
    });
    const eg = this.edgeLines.geometry.attributes;
    eg.aGrow.needsUpdate = true;
    eg.aAlpha.needsUpdate = true;
    eg.aColor.needsUpdate = true;

    const packetOn = span(g, 4.25, 4.5, 4.78, 5.0);
    this.packets.forEach((p, i) => {
      const edge = this.edges[p.edge];
      const from3 = this.nodes[edge.a].pos;
      const to3 = this.nodes[edge.b].pos;
      let f = (t * p.speed + p.phase) % 1;
      if (p.reverse) f = 1 - f;
      this.packetPos[i * 3] = lerp(from3.x, to3.x, f);
      this.packetPos[i * 3 + 1] = lerp(from3.y, to3.y, f);
      this.packetPos[i * 3 + 2] = lerp(from3.z, to3.z, f);
      this.packetAlpha[i] = this.edgeGrow[p.edge * 4] > 0.98 ? packetOn * 0.9 * dim : 0;
      pal.hot.toArray(this.packetColor, i * 3);
    });
    const pg = this.packetPoints.geometry.attributes;
    pg.position.needsUpdate = true;
    pg.aAlpha.needsUpdate = true;
    pg.aColor.needsUpdate = true;

    for (let j = 0; j < TENANTS; j++) {
      const n = j;
      const ring = j % 3;
      const p = orbitPoint(ring, t * (0.5 - ring * 0.12) * (j % 2 ? -1 : 1) + j * 1.9);
      this.moverPos[n * 3] = p[0];
      this.moverPos[n * 3 + 1] = p[1];
      this.moverPos[n * 3 + 2] = p[2];
      this.moverSize[n] = 190 * NODE_SCALE;
      this.moverAlpha[n] = Math.min(1, tenants * dim * boost * 0.95);
      pal.a.toArray(this.moverColor, n * 3);
    }
    const mg = this.moverPoints.geometry.attributes;
    mg.position.needsUpdate = true;
    mg.aSize.needsUpdate = true;
    mg.aAlpha.needsUpdate = true;
    mg.aColor.needsUpdate = true;

    const u = this.particleMaterial.uniforms;
    u.uTime.value = t;
    u.uMix.value = from.form === to.form ? 0 : blend;
    const stageO = (stage) => (this.themeName === 'light' && stage.oLight !== undefined ? stage.oLight : stage.o);
    u.uOpacity.value = lerp(stageO(from), stageO(to), blend) * dim;
    u.uMouseOn.value = this.pointerOn * 0.7;
    u.uColA.value.lerp(this.particleTheme.a, 1 - Math.exp(-dt * 5));
    u.uColB.value.lerp(this.particleTheme.b, 1 - Math.exp(-dt * 5));
    u.uHot.value.lerp(this.particleTheme.hot, 1 - Math.exp(-dt * 5));
    const rock = lerp(from.rock, to.rock, blend);
    const tilt = lerp(from.tilt, to.tilt, blend);
    const yaw = lerp(t * 0.08, Math.sin(t * 0.12) * 0.4, rock) + this.pointerSmooth.x * 0.08;
    const still = lerp(from.still, to.still, blend);
    this.form.rotation.y = lerp(yaw, 0, still);
    this.form.rotation.x = lerp(tilt - this.pointerSmooth.y * 0.15, 0, still);

    this.updateCamera(shift, lerp(from.radius, to.radius, blend), lerp(from.pad, to.pad, blend), lerp(from.wide || 0, to.wide || 0, blend), t);
    this.updateLabels();
    this.ray.setFromCamera(this.pointerSmooth, this.camera);
    if (this.ray.ray.intersectPlane(this.plane, this.hit)) u.uMouse.value.copy(this.hit);
  }

  tick() {
    if (!this.running) return;
    const now = performance.now() / 1000;
    const dt = Math.min(now - this.last, 0.05);
    this.last = now;
    this.time += dt;
    this.step(dt);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now() / 1000;
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  dispose() {
    this.stop();
    for (const label of this.labels) label.el.remove();
    this.particles.geometry.dispose();
    this.moverPoints.geometry.dispose();
    this.nodePoints.geometry.dispose();
    this.edgeLines.geometry.dispose();
    this.packetPoints.geometry.dispose();
    for (const m of [this.particleMaterial, this.nodeMaterial, this.edgeMaterial]) m.dispose();
    this.renderer.dispose();
  }
}
