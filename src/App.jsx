import { useState } from 'react';
import { useReducedMotion, useTheme } from './hooks';
import StoryView from './views/StoryView';

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
  return <StoryView theme={theme} toggleTheme={toggleTheme} reduced={reduced} gl={gl} />;
}
