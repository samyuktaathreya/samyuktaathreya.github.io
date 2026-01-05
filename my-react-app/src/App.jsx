import './App.css'
import Home from './Pages/Home';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function About() {
  return <h2>About Page</h2>;
}

function Projects() {
  return <h2>Projects Page</h2>;
}

function Contact() {
  return <h2>Contact Page</h2>;
}

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

export default function App() {
  return (
    <BrowserRouter>
      <div className="topbar">
        <header className="site-identity" aria-label="Site identity">
          <img className="avatar" src="/samyuktapic.jpeg" alt="Samyukta Athreya" 
          href="#home"
          
          />
          <span className="site-name"><span className="header-title">Samyukta Athreya</span></span>
        </header>

        <nav className="navigation">
          <a href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
          
          >Home</a>
          <a 
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('about');
            }}
          >About</a>
          <a href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('projects');
            }}
          >Projects</a>
          <a href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
          >Contact</a>
        </nav>
      </div>

      <div className="sections" id="sections">
        <section id="home" className="page-section">
          <Home />
        </section>

        <section id="about" className="page-section">
          <About />
        </section>

        <section id="projects" className="page-section">
          <Projects />
        </section>

        <section id="contact" className="page-section">
          <Contact />
        </section>
      </div>
    </BrowserRouter>
  );
}
