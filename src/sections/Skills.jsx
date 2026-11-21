import { skills } from '../content';
import Heading from '../components/Heading';
import Reveal from '../components/Reveal';

export default function Skills() {
  return (
    <section className="skills chapter">
      <Heading>
        Tools I <em>use.</em>
      </Heading>
      <dl className="rows rows--stack">
        {skills.map((group, i) => (
          <Reveal key={group.group} className="rows__item rows__item--stack" delay={i * 60}>
            <dt>{group.group}</dt>
            <dd>{group.items.join(' · ')}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
