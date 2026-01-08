import { useState } from "react";

const scrollToSection = (id) => {
  if (typeof window === 'undefined') return;
  const container = document.getElementById('sections');
  const target = document.getElementById(id);
  if (container && target) {
    container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  } else if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function About() {
    const [slide, setSlide] = useState(0);

    const goTo = (i) => setSlide(i);

    return (
      <section id="about" className="about sec-pad">
      <div className="main-container">
        <div className="about__content">
          <div className="about__content-main">
            <h3 className="about__content-title">Get to know me!</h3>
            <div className="about__slides">
              <div className={`slide ${slide === 0 ? 'active' : ''}`}>
                <div className="about__content-details">
                  <p className="about__content-details-para">
                    Hey! I’m <strong>Samyukta Athreya</strong>, a junior at
                    <strong> Carnegie Mellon University</strong> studying Computer Engineering
                    with a minor in AI. I love using my full stack and ML skills to build the apps I wish existed!
                    You can check them out below.
                  </p>
                </div>
                <a href="./#projects" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('projects');
                  }}
                className="btn btn--med btn--theme dynamicBgClr">Projects</a>
                <a href="/resume.pdf" className="btn btn--med btn--theme dynamicBgClr">Resume</a>
              </div>

              <div className={`slide ${slide === 1 ? 'active' : ''}`}>
                <p className="about__content-details-para">
                  In my free time, I enjoy running, language learning, and producing music. Check out my
                  music here!
                </p>
                <iframe
                  data-testid="embed-iframe"
                  title="Spotify track"
                  style={{ borderRadius: '12px', marginTop: '1rem' }}
                  src="https://open.spotify.com/embed/track/2fQ6FuTCGKJ1QmHTGlsBdF?utm_source=generator"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            <div className="slide-controls" role="group" aria-label="About slides">
              <button className="arrow prev" onClick={() => setSlide(s => Math.max(0, s - 1))} aria-label="Previous slide">‹</button>
              <button className="arrow next" onClick={() => setSlide(s => Math.min(1, s + 1))} aria-label="Next slide">›</button>
            </div>
          </div>
          <div className="about__content-skills">
            <h3 className="about__content-title">My Skills</h3>
            <div className="skills">
              <div className="skills__skill">HTML/CSS</div>
              <div className="skills__skill">JavaScript/TypeScript</div>
              <div className="skills__skill">React</div>
              <div className="skills__skill">Python</div>
              <div className="skills__skill">C/C++</div>
              <div className="skills__skill">FastAPI</div>
              <div className="skills__skill">CI/CD</div>
              <div className="skills__skill">RESTful APIs</div>
              <div className="skills__skill">Authentication (JWT)</div>
              <div className="skills__skill">Git</div>
              <div className="skills__skill">SQL/MongoDB</div>
              <div className="skills__skill">AI/ML</div>
            </div>
          </div>
        </div>
      </div>
      </section>

    );
}