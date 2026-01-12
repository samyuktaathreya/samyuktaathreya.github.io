import './App.css'
import Home from './Pages/Home';
import About from './Pages/About';
import Projects from './Pages/Projects';
import Contact from './Pages/Contact';
import ProjectDetails from './Pages/ProjectsDetails'; // 👈 ADD THIS
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function HomePage() {
  return (
    <>
      <div className="topbar">
        <header className="site-identity" aria-label="Site identity">
          <img className="avatar" src="/samyuktapic.jpeg" alt="Samyukta Athreya" />
          <span className="site-name">
            <span className="header-title">Samyukta Athreya</span>
          </span>
        </header>

        <nav className="navigation">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
          <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}>Portfolio</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
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
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MAIN SCROLL PAGE */}
        <Route path="/" element={<HomePage />} />

        {/* DETAILS PAGE */}
        <Route path="/projects/:id" element={<ProjectDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
