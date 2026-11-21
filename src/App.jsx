import { useCallback, useEffect, useRef, useState } from 'react';
import './story/story.css';
import { chapters, screens } from './content';
import Nav from './components/Nav';
import Pager from './components/Pager';
import ProgressBar from './components/ProgressBar';
import Rail from './components/Rail';
import Screen from './components/Screen';
import useMinWidth from './hooks/useMinWidth';
import useReducedMotion from './hooks/useReducedMotion';
import useScene from './hooks/useScene';
import useStepScroll from './hooks/useStepScroll';
import useTheme from './hooks/useTheme';
import About from './sections/About';
import Background from './sections/Background';
import Contact from './sections/Contact';
import Experience from './sections/Experience';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import Skills from './sections/Skills';

const LINKS = chapters.filter((c) => c.id !== 'intro');
const FIRST = {};
screens.forEach((s, i) => {
  if (!(s.group in FIRST)) FIRST[s.group] = i;
});

function webglAvailable() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const reduced = useReducedMotion();
  const [gl] = useState(webglAvailable);
  const wide = useMinWidth(1100);
  const snap = wide && !reduced;
  const canvas = useRef(null);
  const labels = useRef(null);
  const [current, setCurrent] = useState(0);
  const screen = screens[current];
  const ready = useScene({ canvasRef: canvas, labelsRef: labels, enabled: gl && !reduced, theme, screen });

  useEffect(() => {
    if (!snap) return undefined;
    document.documentElement.classList.add('snap');
    return () => document.documentElement.classList.remove('snap');
  }, [snap]);

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

  useStepScroll({ current, enabled: snap, goTo });

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
      <Nav theme={theme} onToggle={toggleTheme} active={screen.group} onJump={jump} links={LINKS} menu={chapters} />
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
      {snap && current > 0 && <Pager current={current} total={screens.length} onGo={goTo} />}
    </>
  );
}
