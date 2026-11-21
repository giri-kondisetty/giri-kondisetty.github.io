function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r) {
  return (r() + r() + r() - 1.5) * 1.6;
}

function rotateX(out, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  for (let i = 0; i < out.length; i += 3) {
    const y = out[i + 1];
    const z = out[i + 2];
    out[i + 1] = y * c - z * s;
    out[i + 2] = y * s + z * c;
  }
  return out;
}

function sphere(n) {
  const r = rng(11);
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const a = golden * i;
    const radius = 2.15 + gauss(r) * 0.035;
    out[i * 3] = Math.cos(a) * ring * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(a) * ring * radius;
  }
  return out;
}

function galaxy(n, tilt = 1.05) {
  const r = rng(37);
  const out = new Float32Array(n * 3);
  const arms = 3;
  for (let i = 0; i < n; i++) {
    const radius = Math.pow(r(), 0.62) * 3.6;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const angle = radius * 1.35 + arm + gauss(r) * (0.32 - radius * 0.04);
    out[i * 3] = Math.cos(angle) * radius;
    out[i * 3 + 1] = gauss(r) * 0.12 * (1 + (3.6 - radius) * 0.25);
    out[i * 3 + 2] = Math.sin(angle) * radius;
  }
  return tilt ? rotateX(out, tilt) : out;
}

function scaled(out, factor) {
  for (let i = 0; i < out.length; i++) out[i] *= factor;
  return out;
}

const RINGS = [
  { radius: 1.9, rx: 1.35, rz: 0.3 },
  { radius: 3.1, rx: 0.85, rz: -0.9 },
  { radius: 4.4, rx: 0.3, rz: 0.6 },
];

export function orbitPoint(ring, u) {
  const { radius, rx, rz } = RINGS[ring];
  const x = Math.cos(u) * radius;
  const z = Math.sin(u) * radius;
  const y1 = -z * Math.sin(rx);
  const z1 = z * Math.cos(rx);
  return [x * Math.cos(rz) - y1 * Math.sin(rz), x * Math.sin(rz) + y1 * Math.cos(rz), z1];
}

function orbits(n) {
  const r = rng(43);
  const out = new Float32Array(n * 3);
  const core = Math.floor(n * 0.22);
  for (let i = 0; i < n; i++) {
    if (i < core) {
      out[i * 3] = gauss(r) * 0.42;
      out[i * 3 + 1] = gauss(r) * 0.42;
      out[i * 3 + 2] = gauss(r) * 0.42;
    } else {
      const p = orbitPoint(i % RINGS.length, r() * Math.PI * 2);
      out[i * 3] = p[0] + gauss(r) * 0.07;
      out[i * 3 + 1] = p[1] + gauss(r) * 0.07;
      out[i * 3 + 2] = p[2] + gauss(r) * 0.07;
    }
  }
  return out;
}

function sealed(n) {
  const r = rng(29);
  const outer = Math.floor(n * 0.58);
  const out = new Float32Array(n * 3);
  out.set(scaled(sphere(outer), 2.1));
  const inner = n - outer;
  const dim = Math.ceil(Math.cbrt(inner));
  const step = 2.4 / (dim - 1);
  let i = outer;
  for (let x = 0; x < dim && i < n; x++) {
    for (let y = 0; y < dim && i < n; y++) {
      for (let z = 0; z < dim && i < n; z++) {
        out[i * 3] = x * step - 1.2 + (r() - 0.5) * 0.04;
        out[i * 3 + 1] = y * step - 1.2 + (r() - 0.5) * 0.04;
        out[i * 3 + 2] = z * step - 1.2 + (r() - 0.5) * 0.04;
        i++;
      }
    }
  }
  return out;
}

const PSYCHOLOGY = [
  'M13 8.57c-.79 0-1.43.64-1.43 1.43s.64 1.43 1.43 1.43 1.43-.64 1.43-1.43-.64-1.43-1.43-1.43',
  'M13 3C9.25 3 6.2 5.94 6.02 9.64L4.1 12.2c-.25.33-.01.8.4.8H6v3c0 1.1.9 2 2 2h1v3h7v-4.68c2.36-1.12 4-3.53 4-6.32 0-3.87-3.13-7-7-7m3 7c0 .13-.01.26-.02.39l.83.66c.08.06.1.16.05.25l-.8 1.39c-.05.09-.16.12-.24.09l-.99-.4c-.21.16-.43.29-.67.39L14 13.83c-.01.1-.1.17-.2.17h-1.6c-.1 0-.18-.07-.2-.17l-.15-1.06c-.25-.1-.47-.23-.68-.39l-.99.4c-.09.03-.2 0-.25-.09l-.8-1.39c-.05-.08-.03-.19.05-.25l.84-.66c-.01-.13-.02-.26-.02-.39s.02-.27.04-.39l-.85-.66c-.08-.06-.1-.16-.05-.26l.8-1.38c.05-.09.15-.12.24-.09l1 .4c.2-.15.43-.29.67-.39L12 6.17c.02-.1.1-.17.2-.17h1.6c.1 0 .18.07.2.17l.15 1.06c.24.1.46.23.67.39l1-.4c.09-.03.2 0 .24.09l.8 1.38c.05.09.03.2-.05.26l-.85.66c.03.12.04.25.04.39',
];

function brain(n) {
  const r = rng(131);
  const out = new Float32Array(n * 3);
  const ctx = document.createElement('canvas').getContext('2d');
  const paths = PSYCHOLOGY.map((d) => new Path2D(d));
  const scale = 0.36;
  let i = 0;
  while (i < n) {
    const x = 3.5 + r() * 17.5;
    const y = 2.5 + r() * 20.5;
    if (!paths.some((path) => ctx.isPointInPath(path, x, y))) continue;
    out[i * 3] = (x - 12.2) * scale;
    out[i * 3 + 1] = -(y - 12.7) * scale;
    out[i * 3 + 2] = (r() - 0.5) * 1.1;
    i++;
  }
  return out;
}

const COSMOS_RADIUS = 9.5;

function cosmos(n) {
  const r = rng(211);
  const out = new Float32Array(n * 3);
  const bulge = Math.floor(n * 0.11);
  const halo = Math.floor(n * 0.05);
  for (let i = 0; i < n; i++) {
    let x;
    let y;
    let z;
    if (i < bulge) {
      x = gauss(r) * 0.7;
      z = gauss(r) * 0.7;
      y = gauss(r) * 0.4;
    } else if (i < bulge + halo) {
      x = gauss(r) * 3.8;
      z = gauss(r) * 3.8;
      y = gauss(r) * 1.2;
    } else {
      const radius = Math.min(0.9 + Math.pow(r(), 0.72) * (COSMOS_RADIUS - 0.9), COSMOS_RADIUS);
      const inArm = r() < 0.86;
      const arm = (i % 2) * Math.PI;
      const angle = inArm ? arm + radius * 0.7 + gauss(r) * (0.1 + radius * 0.022) : r() * Math.PI * 2;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = gauss(r) * 0.2 * (1 - (radius / COSMOS_RADIUS) * 0.6);
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

export function buildShapes(n) {
  return {
    sphere: scaled(sphere(n), 2.1),
    galaxy: scaled(galaxy(n, 0), 1.25),
    cosmos: cosmos(n),
    brain: brain(n),
    sealed: sealed(n),
    orbits: orbits(n),
  };
}

export function buildRandom(n) {
  const r = rng(97);
  const out = new Float32Array(n * 4);
  for (let i = 0; i < out.length; i++) out[i] = r();
  return out;
}
