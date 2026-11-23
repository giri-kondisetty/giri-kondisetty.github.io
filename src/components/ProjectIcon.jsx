import './ProjectIcon.css';

function Graph() {
  const outer = [
    [26, 24],
    [194, 20],
    [198, 84],
    [30, 86],
    [112, 8],
  ];
  return (
    <svg viewBox="0 0 220 104" role="presentation">
      {outer.map(([x, y], i) => (
        <path key={`p${i}`} className="pi-flow" style={{ '--i': i }} d={`M110 56L${x} ${y}`} />
      ))}
      {outer.map(([x, y], i) => (
        <circle key={`n${i}`} className="pi-node" style={{ '--i': i }} cx={x} cy={y} r="6" />
      ))}
      <circle className="pi-node" cx="110" cy="56" r="11" />
    </svg>
  );
}

function Route() {
  const right = [20, 52, 84];
  return (
    <svg viewBox="0 0 220 104" role="presentation">
      <path className="pi-flow" d="M44 52H94" />
      {right.map((y, i) => (
        <path key={`r${y}`} className="pi-flow" style={{ '--i': i + 1 }} d={`M126 52C148 52 154 ${y} 176 ${y}`} />
      ))}
      <rect className="pi-layer" x="10" y="38" width="34" height="28" rx="7" />
      <circle className="pi-node" cx="110" cy="52" r="16" />
      {right.map((y, i) => (
        <rect key={`m${y}`} className="pi-layer" style={{ '--i': i }} x="176" y={y - 8} width="34" height="16" rx="5" />
      ))}
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 220 104" role="presentation">
      <path className="pi-flow" d="M110 6L164 24V54C164 77 140 92 110 99C80 92 56 77 56 54V24Z" />
      <path className="pi-lens" d="M90 54l14 14 28-30" />
    </svg>
  );
}

function Plug() {
  const left = [18, 52, 86];
  return (
    <svg viewBox="0 0 220 104" role="presentation">
      {left.map((y, i) => (
        <path key={`l${y}`} className="pi-flow" style={{ '--i': i }} d={`M40 ${y}C70 ${y} 80 52 104 52`} />
      ))}
      {left.map((y, i) => (
        <path key={`r${y}`} className="pi-flow" style={{ '--i': i + 3 }} d={`M116 52C140 52 150 ${y} 180 ${y}`} />
      ))}
      {left.map((y, i) => (
        <rect key={`a${y}`} className="pi-layer" style={{ '--i': i }} x="14" y={y - 8} width="26" height="16" rx="5" />
      ))}
      {left.map((y, i) => (
        <rect key={`b${y}`} className="pi-layer" style={{ '--i': i + 3 }} x="180" y={y - 8} width="26" height="16" rx="5" />
      ))}
      <circle className="pi-node" cx="110" cy="52" r="9" />
    </svg>
  );
}

function Branch() {
  return (
    <svg viewBox="0 0 220 104" role="presentation">
      <path className="pi-flow" d="M16 72H204" />
      <path className="pi-flow" style={{ '--i': 1 }} d="M64 72C84 72 84 30 112 30H148C176 30 176 72 196 72" />
      {[16, 64, 196].map((x, i) => (
        <circle key={x} className="pi-node" style={{ '--i': i }} cx={x} cy="72" r="6" />
      ))}
      {[112, 148].map((x, i) => (
        <circle key={x} className="pi-node" style={{ '--i': i + 3 }} cx={x} cy="30" r="6" />
      ))}
    </svg>
  );
}

const ICONS = { graph: Graph, route: Route, shield: Shield, plug: Plug, branch: Branch };

export default function ProjectIcon({ name }) {
  const Shape = ICONS[name] ?? Graph;
  return (
    <div className="project-icon" aria-hidden="true">
      <Shape />
    </div>
  );
}
