import { useState } from 'react';
import { profile } from '../content';
import Arrow from '../components/Arrow';
import Heading from '../components/Heading';
import Magnetic from '../components/Magnetic';
import Reveal from '../components/Reveal';
import './Contact.css';

export default function Contact() {
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
