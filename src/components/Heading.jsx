import Reveal from './Reveal';

export default function Heading({ children }) {
  return (
    <Reveal className="heading">
      <h2 className="h2">{children}</h2>
    </Reveal>
  );
}
