import { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaCode }from "react-icons/fa";
import Typed from 'typed.js';

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
    const [show,setShow] = useState(false);
    const sectionRef = useRef(null);
    useEffect(() => {
        const rootEl = document.querySelector('.sections');
        const el = sectionRef.current;
        if (!el || !rootEl) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShow(true);
          }
          else {
            setShow(false);
          }
        },
        { root:rootEl, threshold: 0.25 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

  //typing effect
  const quoteRef = useRef(null);
  const typedRef = useRef(null);

  useEffect(() => {
    const container = sectionRef.current?.querySelector(".about-container");
    if (!container || !quoteRef.current) return;

    if (typedRef.current) {
      typedRef.current.destroy();
      typedRef.current = null;
    }

    if (!show) {
      quoteRef.current.textContent = "";
      return;
    }

    const startTyping = () => {
      if (typedRef.current) return;
      typedRef.current = new Typed(quoteRef.current, {
        strings: ['"The best way to predict the future is to invent it."'],
        typeSpeed: 50,
        backSpeed: 0,
        smartBackspace: true,
      });
    };

    const onTransitionEnd = (e) => {
      if (e.target === container && (e.propertyName === 'opacity' || e.propertyName === 'transform')) {
        container.removeEventListener("transitioned", onTransitionEnd);
        startTyping();
      }
    };

    container.addEventListener("transitionend", onTransitionEnd);
    
    const fallback = setTimeout(startTyping, 700);
    return () => {
      container.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(fallback);
      if (typedRef.current) {
        typedRef.current.destroy();
        typedRef.current = null;
      }
    };
  }, [show]);

    return (
      <section className="about-section" ref={sectionRef}>
      <div className={`about-container ${show ? 'show' : ''}`}>
        <h1 className="about-title reveal">About</h1>
        <h2 className="about-quote">
          <span className="quote-placeholder">"The best way to predict the future is to invent it."</span>
          <div className="quote-typed"><span ref={quoteRef} /></div>
        </h2>
        
        <div className="about-paragraph reveal">
          <p>
            Hi! I'm <span>Samyukta Athreya</span>, a junior at <span>Carnegie Mellon University</span> studying
            Electrical & Computer Engineering with a minor in AI. My particular interests are full stack and AI, two fields that
            give me the most power to create the apps I wish existed! You can check them out in the <span>Portfolio</span> section.
          </p>
          <div className="aboutButtons">
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <button className="resume-button">
                <FaFilePdf style={{ marginRight: '10', transform: 'scale(0.9) translateY(2px)' }} />
                Resume
              </button>
            </a>
            <a href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('projects');
              }}
            >
            <button className="projects-button">
              <FaCode style={{ marginRight: '10', transform: 'scale(0.9) translateY(2px)' }} />
              Portfolio
            </button>
            </a>
          </div>
        </div>
      </div>
      </section>

    );
}