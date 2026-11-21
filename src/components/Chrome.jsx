import { useEffect, useRef, useState } from 'react';
import { profile, storyChapters } from '../data';

function Sun() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z" />
    </svg>
  );
}

function Bars({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
    </svg>
  );
}

export function Nav({ theme, onToggle, active, onJump, links, menu }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (event, id) => {
    setOpen(false);
    onJump(event, id);
  };

  return (
    <header className="nav">
      <a className="nav__brand" href="#intro" onClick={(e) => go(e, 'intro')}>
        <span className="nav__mark" aria-hidden="true">GK</span>
        <span className="nav__name">{profile.name}</span>
      </a>
      <nav className="nav__links" aria-label="Sections">
        {links.map((c) => (
          <a key={c.id} href={`#${c.id}`} className={active === c.id ? 'is-active' : ''} onClick={(e) => go(e, c.id)}>
            {c.label}
          </a>
        ))}
      </nav>
      <div className="nav__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        {profile.resume ? (
          <a className="btn btn--solid btn--sm nav__cta" href={profile.resume} target="_blank" rel="noopener">
            Résumé
          </a>
        ) : (
          <a className="btn btn--solid btn--sm nav__cta" href="#contact" onClick={(e) => go(e, 'contact')}>
            Get in touch
          </a>
        )}
        <button
          type="button"
          className="icon-btn nav__menu"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <Bars open={open} />
        </button>
      </div>
      <nav id="mobile-menu" className={`menu ${open ? 'is-open' : ''}`} aria-label="Menu" hidden={!open}>
        {menu.map((c, i) => (
          <a key={c.id} href={`#${c.id}`} onClick={(e) => go(e, c.id)} className={active === c.id ? 'is-active' : ''}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {c.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export function Rail({ active, onJump, items = storyChapters }) {
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

export function ProgressBar() {
  const ref = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div className="progress" ref={ref} aria-hidden="true" />;
}
