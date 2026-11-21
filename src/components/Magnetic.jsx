import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Magnetic({ as: Tag = 'a', strength = 0.28, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const x = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (event) => {
      const box = node.getBoundingClientRect();
      x((event.clientX - (box.left + box.width / 2)) * strength);
      y((event.clientY - (box.top + box.height / 2)) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', leave);
    return () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <Tag ref={ref} className={`magnetic ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
