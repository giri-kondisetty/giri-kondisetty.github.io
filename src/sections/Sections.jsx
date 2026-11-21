import { useState } from 'react';
import { about, certifications, education, experience, profile, projects, skills } from '../data';
import Motif from '../components/Motif';
import { Arrow, Counter, Magnetic, Reveal, Spin } from '../components/ui';

function Heading({ children }) {
  return (
    <Reveal className="heading">
      <h2 className="h2">{children}</h2>
    </Reveal>
  );
}

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

export function Hero({ onJump }) {
  return (
    <section className="hero chapter">
      <figure className="hero__photo">
        <img
          src="boston.webp"
          srcSet="boston-1000.webp 1000w, boston.webp 2000w"
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

export function About({ reduced }) {
  return (
    <section className="about chapter">
      <div className="about__grid">
        <Reveal className="about__photo">
          <Spin front="profile.webp" alt="Portrait of Giri Kondisetty" label="Portrait of Giri Kondisetty. Drag, or use the left and right arrow keys, to rotate." back="GK" reduced={reduced} />
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

function ArrowDown() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

export function Overview({ onOpen }) {
  return (
    <section className="overview chapter">
      <Heading>
        Projects I build <em>outside work.</em>
      </Heading>
      <p className="overview__lead">Separate projects that I joined into one product, end to end.</p>
      <ul className="pcards pcards--4">
        {projects.map((project, i) => (
          <Reveal as="li" key={project.id} className="pcard" delay={i * 80}>
            <Motif name={project.motif} />
            <p className="pcard__kind">{project.kind}</p>
            <h3>{project.title}</h3>
            <p>{project.text}</p>
            <div className="pcard__links">
              {project.site && (
                <a className="btn btn--solid btn--sm" href={project.site} target="_blank" rel="noopener" aria-label={`Visit site: ${project.title}`}>
                  Visit site
                  <Arrow />
                </a>
              )}
              <a className="btn btn--ghost btn--sm" href={`#${project.id}`} onClick={(e) => onOpen(e, project.id)} aria-label={`How it works: ${project.title}`}>
                How it works
                <ArrowDown />
              </a>
            </div>
          </Reveal>
        ))}
      </ul>
      <p className="overview__more">
        More on{' '}
        <a href={profile.github} target="_blank" rel="noopener">
          GitHub
          <Arrow />
        </a>
      </p>
    </section>
  );
}

export function Experience() {
  return (
    <section className="experience chapter">
      <Heading>
        Work <em>experience.</em>
      </Heading>
      <ol className="xp">
        {experience.map((job, i) => (
          <Reveal as="li" key={`${job.company}-${job.period}`} className="xp__row" delay={i * 70}>
            <p className="xp__period">{job.period}</p>
            <div className="xp__head">
              <h3>{job.role}</h3>
              <p>{job.company}</p>
            </div>
            <ul>
              {job.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Background() {
  return (
    <section className="background chapter">
      <Heading>
        Education and <em>certifications.</em>
      </Heading>
      <div className="bg">
        <h3 className="mini">Education</h3>
        <ol className="rows">
          {education.map((item, i) => (
            <Reveal as="li" key={item.school} className="rows__item rows__item--edu" delay={i * 70}>
              <p className="rows__when">{item.period}</p>
              <h4>{item.degree}</h4>
              <p className="rows__where">{item.school}</p>
            </Reveal>
          ))}
        </ol>
        <h3 className="mini bg__gap">Certifications</h3>
        <ul className="rows rows--two">
          {certifications.map((cert, i) => (
            <Reveal as="li" key={cert.title} className="rows__item rows__item--cert" delay={i * 50}>
              <h4>{cert.title}</h4>
              <p className="rows__where">{cert.issuer}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Stack() {
  return (
    <section className="stack chapter">
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

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section className="contact chapter">
      <Heading>
        Let&rsquo;s <em>talk.</em>
      </Heading>
      <Reveal delay={120} className="contact__body">
        <p className="body">
          I am happy to talk about security engineering, AI systems and the projects here. Email is the fastest way to reach me.
        </p>
        <a className="contact__mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="contact__cta">
          <Magnetic as="button" type="button" className="btn btn--solid" onClick={copy}>
            {copied ? 'Copied' : 'Copy email'}
          </Magnetic>
          <Magnetic className="btn btn--ghost" href={profile.github} target="_blank" rel="noopener">
            GitHub
            <Arrow />
          </Magnetic>
          <Magnetic className="btn btn--ghost" href={profile.linkedin} target="_blank" rel="noopener">
            LinkedIn
            <Arrow />
          </Magnetic>
          {profile.resume && (
            <Magnetic className="btn btn--ghost" href={profile.resume} target="_blank" rel="noopener">
              Résumé
              <Arrow />
            </Magnetic>
          )}
        </div>
      </Reveal>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
      </footer>
    </section>
  );
}
