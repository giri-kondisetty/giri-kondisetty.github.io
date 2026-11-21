import { useCallback, useEffect, useRef, useState } from 'react';
import '../story/story.css';
import { screens, chapters } from '../content';
import Screen from '../story/Screen';
import Nav from '../components/Nav';
import ProgressBar from '../components/ProgressBar';
import Rail from '../components/Rail';
import { useMinWidth } from '../hooks';
import About from '../sections/About';
import Background from '../sections/Background';
import Contact from '../sections/Contact';
import Experience from '../sections/Experience';
import Hero from '../sections/Hero';
import Projects from '../sections/Projects';
import Skills from '../sections/Skills';

const LINKS = chapters.filter((c) => c.id !== 'intro');
const FIRST = {};
screens.forEach((s, i) => {
  if (!(s.group in FIRST)) FIRST[s.group] = i;
});

function Arrow({ up }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {up ? <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /> : <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />}
    </svg>
  );
}

export default function StoryView({ theme, toggleTheme, reduced, gl }) {
  const canvas = useRef(null);
  const world = useRef(null);
  const labels = useRef(null);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const screen = screens[current];
  const wide = useMinWidth(1100);
  const snap = wide && !reduced;

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (!snap) return undefined;
    document.documentElement.classList.add('snap');
    return () => document.documentElement.classList.remove('snap');
  }, [snap]);

  useEffect(() => {
    if (!canvas.current || !gl || reduced) return undefined;
    let cancelled = false;
    let teardown = () => {};

    import('../scene/Scene').then(({ Scene }) => {
      if (cancelled || !canvas.current) return;
      const light = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1100;
      const instance = new Scene(canvas.current, { count: light ? 8000 : 22000, labelHost: labels.current });
      world.current = instance;
      instance.setTheme(document.documentElement.getAttribute('data-theme') || 'light');
      instance.start();
      setReady(true);

      const onResize = () => instance.resize();
      const onPointer = (event) => {
        if (event.pointerType === 'touch') return;
        instance.setPointer((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1), true);
      };
      const onLeave = () => instance.setPointer(0, 0, false);
      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      teardown = () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('pointerleave', onLeave);
        instance.dispose();
        world.current = null;
      };
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [gl, reduced]);

  useEffect(() => {
    world.current?.setTheme(theme);
  }, [theme, ready]);

  useEffect(() => {
    world.current?.setProgress(screen.g, screen.dim);
  }, [screen, ready]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(Number(entry.target.dataset.screen));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    document.querySelectorAll('[data-screen]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index) => {
    document.querySelector(`[data-screen="${index}"]`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [reduced]);

  useEffect(() => {
    if (!snap) return undefined;
    const last = screens.length - 1;
    const SETTLE = 380;
    const NOTCH_SETTLE = 520;
    const GLIDE = 520;
    let lastStepWall = -1e9;
    let lastStep = -1e9;
    let lastWheel = 0;
    let prevAbs = 0;
    let armed = false;
    let travelled = 0;

    const room = (direction) => {
      const el = document.querySelector(`[data-screen="${currentRef.current}"]`);
      if (!el) return false;
      if (el.offsetHeight <= window.innerHeight + 24) return false;
      const rect = el.getBoundingClientRect();
      return direction > 0 ? rect.bottom - window.innerHeight > 24 : -rect.top > 24;
    };

    const step = (direction) => {
      const next = Math.min(Math.max(currentRef.current + direction, 0), last);
      if (next === currentRef.current) return false;
      goTo(next);
      return true;
    };

    const onWheel = (event) => {
      if (event.ctrlKey) return;
      const direction = Math.sign(event.deltaY);
      if (!direction) return;
      const moving = performance.now() - lastStepWall < GLIDE;
      if (!moving && room(direction)) return;
      if ((direction < 0 && currentRef.current === 0) || (direction > 0 && currentRef.current === last)) return;
      event.preventDefault();

      const now = event.timeStamp;
      const abs = Math.abs(event.deltaY);
      const gap = now - lastWheel;
      lastWheel = now;
      const pushed = gap > 260 || abs > prevAbs * 1.6 + 6;
      const notch = (event.deltaMode !== 0 || abs >= 100) && now - lastStep > NOTCH_SETTLE;
      prevAbs = abs;

      if (moving || now - lastStep < SETTLE) return;
      if (pushed || notch) {
        if (!armed || gap > 260) travelled = 0;
        armed = true;
      }
      if (!armed) return;
      travelled += event.deltaY;
      if (Math.abs(travelled) < 36) return;
      armed = false;
      travelled = 0;
      if (step(direction)) {
        lastStep = now;
        lastStepWall = performance.now();
        currentRef.current = Math.min(Math.max(currentRef.current + direction, 0), last);
      }
    };

    const onKey = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = event.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target.isContentEditable) return;
      let direction = 0;
      if (event.key === 'ArrowDown' || event.key === 'PageDown') direction = 1;
      else if (event.key === 'ArrowUp' || event.key === 'PageUp') direction = -1;
      else if (event.key === ' ' && tag !== 'BUTTON' && tag !== 'A') direction = event.shiftKey ? -1 : 1;
      else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        goTo(event.key === 'Home' ? 0 : last);
        return;
      }
      if (!direction || room(direction)) return;
      event.preventDefault();
      step(direction);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo, snap]);

  const jump = useCallback(
    (event, id) => {
      event.preventDefault();
      if (id in FIRST) goTo(FIRST[id]);
    },
    [goTo],
  );

  const open = useCallback(
    (event, id) => {
      event.preventDefault();
      const index = screens.findIndex((s) => s.id === id);
      if (index >= 0) goTo(index);
    },
    [goTo],
  );

  const wrap = (index, children, className = '') => (
    <div key={screens[index].id} id={screens[index].id} className={`screen screen--plain ${className} ${current === index ? 'is-active' : ''}`} data-screen={index}>
      {children}
    </div>
  );

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <canvas ref={canvas} className={`gl ${ready ? 'is-ready' : ''}`} aria-hidden="true" />
      <div className="veil" aria-hidden="true" />
      <div ref={labels} className="glabels" aria-hidden="true" />
      <ProgressBar />
      <Nav
        theme={theme}
        onToggle={toggleTheme}
        active={screen.group}
        onJump={jump}
        links={LINKS}
        menu={chapters}
      />
      <Rail active={screen.group} onJump={jump} items={chapters} />
      <main id="main" tabIndex={-1} className="page">
        {screens.map((s, i) => {
          if (s.kind === 'hero') return wrap(i, <Hero onJump={jump} />);
          if (s.kind === 'about') return wrap(i, <About reduced={reduced} />);
          if (s.kind === 'experience') return wrap(i, <Experience />, 'screen--tight');
          if (s.kind === 'projects') return wrap(i, <Projects onOpen={open} />, 'screen--tight');
          if (s.kind === 'background') return wrap(i, <Background />, 'screen--tight');
          if (s.kind === 'skills') return wrap(i, <Skills />, 'screen--tight');
          if (s.kind === 'contact') return wrap(i, <Contact />);
          return <Screen key={s.id} screen={s} index={i} active={current === i} />;
        })}
      </main>
      {snap && current > 0 && (
        <div className="pager" role="group" aria-label="Page position">
          <button type="button" onClick={() => goTo(current - 1)} aria-label="Previous screen">
            <Arrow up />
          </button>
          <button type="button" onClick={() => goTo(current + 1)} disabled={current === screens.length - 1} aria-label="Next screen">
            <Arrow />
          </button>
        </div>
      )}
    </>
  );
}
