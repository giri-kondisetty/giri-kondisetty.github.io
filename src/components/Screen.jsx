import './Screen.css';

export default function Screen({ screen, index, active }) {
  return (
    <section id={screen.id} className={`screen ${active ? 'is-active' : ''}`} data-screen={index} aria-labelledby={`${screen.id}-title`}>
      <div className="screen__inner">
        <div className="narr rise" style={{ '--r': 0 }}>
          <h2 id={`${screen.id}-title`} className="narr__title">
            {screen.title}
          </h2>
          <p className="narr__text">{screen.text}</p>
        </div>
      </div>
    </section>
  );
}
