import {FaGithub, FaLinkedin, FaMailBulk, FaSpotify} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { Github, Link } from 'lucide-react';

export default function Contact() {
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
    return (
        <section className="contact-section" ref={sectionRef}>
            <div className={`contact-container ${show ? 'show' : ''}`}>
                <h1 className="contact-title">
                    Contact Me
                </h1>

                <h2 className="lets-connect">Let's Connect!
                    <Link className="contact-img"></Link>
                </h2>
                <div className="contact-cards">
                    {/*Github */}
                    <div className="contact-card"
                        onClick={() => (window.open("https://github.com/samyuktaathreya", '_blank', 'noopener,noreferrer'))}
                    >
                        <FaGithub className="contact-logo" />
                        <p className="contact-name">Github</p>
                    </div>
                    {/*LinkedIn */}
                    <div className="contact-card"
                        onClick={() => (window.open("https://www.linkedin.com/in/samyukta-athreya-b7994728a/", '_blank', 'noopener,noreferrer'))}
                    >
                            <FaLinkedin className="contact-logo-linkedin"/>
                        <p className="contact-name">Linkedin</p>
                    </div>
                    {/*Email */}
                    <div className="contact-card"
                        onClick={() => (window.location.href = "mailto:ssathrey@andrew.cmu.edu?subject=Hello&body=Hi%20Samyukta!")}
                    >
                        <FaMailBulk className="contact-logo-mail" />
                        <p className="contact-name">Email</p>
                    </div>
                    {/* Spotify */}
                    <div className="contact-card"
                        onClick={() => (window.open("https://open.spotify.com/artist/6Pmkc2lzhCZofXauqXekni?si=SP1l80t2ScirBeE5enbMRw", '_blank', 'noopener,noreferrer'))}
                    >
                        <FaSpotify className="contact-logo-spotify" />
                        <p className="contact-name">Spotify</p>
                    </div>
                </div>
            </div>
        </section>
    );
}