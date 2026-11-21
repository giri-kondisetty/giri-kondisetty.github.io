import { chapters } from '../content';

export default function Rail({ active, onJump, items = chapters }) {
  return (
    <nav className={`rail ${active === 'intro' ? 'rail--photo' : ''}`} aria-label="Chapters">
      {items.map((c) => (
        <a key={c.id} href={`#${c.id}`} onClick={(e) => onJump(e, c.id)} className={active === c.id ? 'is-active' : ''} aria-label={c.label}>
          <span className="rail__label">{c.label}</span>
          <span className="rail__dot" />
        </a>
      ))}
    </nav>
  );
}
