import Reveal from './Reveal';
import './Heading.css';

export default function Heading({ children }) {
  return (
    <Reveal className="heading">
      <h2 className="h2">{children}</h2>
    </Reveal>
  );
}
