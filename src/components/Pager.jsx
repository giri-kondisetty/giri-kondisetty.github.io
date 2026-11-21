function Arrow({ up }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {up ? <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /> : <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />}
    </svg>
  );
}

export default function Pager({ current, total, onGo }) {
  return (
    <div className="pager" role="group" aria-label="Page position">
      <button type="button" onClick={() => onGo(current - 1)} aria-label="Previous screen">
        <Arrow up />
      </button>
      <button type="button" onClick={() => onGo(current + 1)} disabled={current === total - 1} aria-label="Next screen">
        <Arrow />
      </button>
    </div>
  );
}
