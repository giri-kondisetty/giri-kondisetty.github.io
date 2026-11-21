import { experience } from '../content';
import Heading from '../components/Heading';
import Reveal from '../components/Reveal';

export default function Experience() {
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
