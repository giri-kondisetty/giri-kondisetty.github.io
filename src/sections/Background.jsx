import { certifications, education } from '../content';
import Heading from '../components/Heading';
import Reveal from '../components/Reveal';

export default function Background() {
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
