import { about } from '../content';
import Counter from '../components/Counter';
import Heading from '../components/Heading';
import Portrait from '../components/Portrait';
import Reveal from '../components/Reveal';

export default function About({ reduced }) {
  return (
    <section className="about chapter">
      <div className="about__grid">
        <Reveal className="about__photo">
          <Portrait front="profile.webp" alt="Portrait of Giri Kondisetty" label="Portrait of Giri Kondisetty. Drag, or use the left and right arrow keys, to rotate." back="GK" reduced={reduced} />
        </Reveal>
        <div className="about__copy">
          <Heading>
            Hello, I&rsquo;m <em>Giri.</em>
          </Heading>
          {about.paragraphs.map((text, i) => (
            <Reveal as="p" key={text} className="body" delay={120 + i * 90}>
              {text}
            </Reveal>
          ))}
          <ul className="stats">
            {about.stats.map((stat, i) => (
              <Reveal as="li" key={stat.label} delay={100 + i * 90}>
                <strong>{stat.text ?? <Counter value={stat.value} suffix={stat.suffix} />}</strong>
                <span>{stat.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
