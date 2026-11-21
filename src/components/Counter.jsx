import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useInView from '../hooks/useInView';

export default function Counter({ value, suffix = '' }) {
  const [ref, seen] = useInView(0.6);
  const text = useRef(null);
  useEffect(() => {
    if (!seen || !text.current) return undefined;
    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => {
        if (text.current) text.current.textContent = Math.round(state.n);
      },
    });
    return () => tween.kill();
  }, [seen, value]);
  return (
    <span ref={ref} className="counter">
      <span ref={text}>{seen ? 0 : value}</span>
      {suffix}
    </span>
  );
}
