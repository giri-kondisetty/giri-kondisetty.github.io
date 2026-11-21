import { useEffect, useRef } from 'react';
import { screens } from '../content';

export default function useStepScroll({ current, enabled, goTo }) {
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (!enabled) return undefined;
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
  }, [goTo, enabled]);
}
