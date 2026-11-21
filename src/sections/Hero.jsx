import { profile } from '../content';
import Magnetic from '../components/Magnetic';

function Letters({ text, offset = 0 }) {
  return (
    <span className="letters" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="ch" style={{ '--i': i + offset }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero({ onJump }) {
  return (
    <section className="hero chapter">
      <figure className="hero__photo">
        <img
          src="hero.webp"
          srcSet="hero-1000.webp 1000w, hero.webp 2000w"
          sizes="100vw"
          alt="Boston University's Center for Computing & Data Sciences rising above the Charles River"
          width="2000"
          height="1335"
          fetchPriority="high"
          decoding="async"
        />
      </figure>
      <div className="hero__copy">
        <p className="hero__eyebrow">
          <span className="pulse" />
          {profile.role}
        </p>
        <h1 className="hero__title" aria-label={profile.name}>
          <span className="hero__line">
            <Letters text={profile.first} />
          </span>{' '}
          <span className="hero__line hero__line--italic">
            <Letters text={profile.last} offset={profile.first.length} />
          </span>
        </h1>
        <p className="hero__lede">{profile.summary}</p>
        <div className="hero__cta">
          <Magnetic className="btn btn--solid" href="#projects" onClick={(e) => onJump(e, 'projects')}>
            View projects
          </Magnetic>
          <Magnetic className="btn btn--ghost" href="#contact" onClick={(e) => onJump(e, 'contact')}>
            Get in touch
          </Magnetic>
        </div>
      </div>
      <ul className="hero__facts" aria-label="Quick facts">
        <li>
          <span>Focus</span>Cloud security · AI systems
        </li>
        <li>
          <span>Experience</span>Security software since 2019
        </li>
        <li>
          <span>Education</span>MS Computer Science, Boston University
        </li>
      </ul>
      <a className="scroll-cue" href="#about" onClick={(e) => onJump(e, 'about')}>
        <span className="scroll-cue__line" />
        About me
      </a>
    </section>
  );
}
