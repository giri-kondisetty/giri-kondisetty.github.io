import { profile, projects } from '../content';
import Arrow from '../components/Arrow';
import Heading from '../components/Heading';
import ProjectIcon from '../components/ProjectIcon';
import Reveal from '../components/Reveal';
import './Projects.css';

function ArrowDown() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

export default function Projects({ onOpen }) {
  return (
    <section className="overview chapter">
      <Heading>
        Projects I build <em>outside work.</em>
      </Heading>
      <p className="overview__lead">Separate projects that I joined into one product, end to end.</p>
      <ul className="pcards pcards--4">
        {projects.map((project, i) => (
          <Reveal as="li" key={project.id} className="pcard" delay={i * 80}>
            <ProjectIcon name={project.icon} />
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
