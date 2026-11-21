import { useEffect, useRef, useState } from 'react';

export default function useScene({ canvasRef, labelsRef, enabled, theme, screen }) {
  const world = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !enabled) return undefined;
    let cancelled = false;
    let teardown = () => {};

    import('../scene/Scene').then(({ Scene }) => {
      if (cancelled || !canvasRef.current) return;
      const light = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1100;
      const instance = new Scene(canvasRef.current, { count: light ? 8000 : 22000, labelHost: labelsRef.current });
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
  }, [enabled, canvasRef, labelsRef]);

  useEffect(() => {
    world.current?.setTheme(theme);
  }, [theme, ready]);

  useEffect(() => {
    world.current?.setProgress(screen.g, screen.dim);
  }, [screen, ready]);

  return ready;
}
