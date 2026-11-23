import { useEffect, useRef } from 'react';
import './Portrait.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function Portrait({ front, alt, label, back, reduced }) {
  const root = useRef(null);
  const body = useRef(null);
  const run = useRef(null);
  const motion = useRef({ angle: 0, tilt: 0, velocity: 0, dragging: false, lastX: 0, lastY: 0, lastT: 0, idle: 0, nudge: -1, touched: false, frame: 0 });

  useEffect(() => {
    const m = motion.current;
    const node = body.current;
    const NUDGE = 1500;

    const draw = (offset) => {
      node.style.transform = `rotateX(${m.tilt.toFixed(2)}deg) rotateY(${(m.angle + offset).toFixed(2)}deg)`;
    };

    const tick = (now) => {
      let offset = 0;
      if (m.nudge >= 0) {
        const t = (now - m.nudge) / NUDGE;
        if (t >= 1 || m.touched) m.nudge = -1;
        else offset = 26 * Math.sin(t * Math.PI * 2) * (1 - t);
      }
      let moving = m.nudge >= 0;
      if (!m.dragging) {
        if (Math.abs(m.velocity) > 0.04) {
          m.angle += m.velocity;
          m.velocity *= 0.94;
          m.idle = now;
          moving = true;
        } else {
          m.velocity = 0;
          const target = Math.round(m.angle / 360) * 360;
          const away = target - m.angle;
          if (!reduced && Math.abs(away) > 0.05 && now - m.idle > 2200) {
            m.angle += away * 0.07;
            moving = true;
          } else if (!reduced && Math.abs(away) > 0.05) {
            moving = true;
          }
        }
        m.tilt *= 0.9;
        if (Math.abs(m.tilt) > 0.05) moving = true;
        else m.tilt = 0;
      } else {
        moving = true;
      }
      draw(offset);
      m.frame = moving ? requestAnimationFrame(tick) : 0;
    };

    run.current = () => {
      if (!m.frame) m.frame = requestAnimationFrame(tick);
    };
    draw(0);

    let seen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (seen || !entries[0].isIntersecting || reduced) return;
        seen = true;
        m.nudge = performance.now() + 500;
        run.current();
      },
      { threshold: 0.6 },
    );
    observer.observe(root.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(m.frame);
      m.frame = 0;
    };
  }, [reduced]);

  const down = (event) => {
    const m = motion.current;
    m.dragging = true;
    m.touched = true;
    m.velocity = 0;
    m.lastX = event.clientX;
    m.lastY = event.clientY;
    m.lastT = event.timeStamp;
    root.current.setPointerCapture?.(event.pointerId);
    root.current.classList.add('is-drag');
    run.current?.();
  };

  const move = (event) => {
    const m = motion.current;
    if (!m.dragging) return;
    const dx = event.clientX - m.lastX;
    const dy = event.clientY - m.lastY;
    const dt = Math.max(event.timeStamp - m.lastT, 1);
    m.angle += dx * 0.9;
    m.tilt = clamp(m.tilt - dy * 0.12, -14, 14);
    m.velocity = clamp(((dx * 0.9) / dt) * 16, -40, 40);
    m.lastX = event.clientX;
    m.lastY = event.clientY;
    m.lastT = event.timeStamp;
  };

  const up = () => {
    const m = motion.current;
    if (!m.dragging) return;
    m.dragging = false;
    m.idle = performance.now();
    root.current.classList.remove('is-drag');
    run.current?.();
  };

  const key = (event) => {
    const m = motion.current;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    m.touched = true;
    m.velocity += event.key === 'ArrowRight' ? 9 : -9;
    run.current?.();
  };

  return (
    <figure
      ref={root}
      className="portrait"
      role="group"
      aria-label={label}
      tabIndex={0}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
    >
      <div className="portrait__body" ref={body}>
        <img className="portrait__face portrait__front" src={front} alt={alt} width="900" height="900" loading="lazy" draggable="false" />
        <div className="portrait__face portrait__back" aria-hidden="true">
          <span>{back}</span>
        </div>
      </div>
    </figure>
  );
}
