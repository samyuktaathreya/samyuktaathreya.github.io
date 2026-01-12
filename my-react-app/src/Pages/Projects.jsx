
import React from 'react';
import {useState, useEffect, useRef} from 'react';
import projects from '../assets/projects.json';
import skills from '../assets/skills.json';
import { FaLayerGroup, FaCode, FaCaretDown }from "react-icons/fa";
import {skillIconMap} from "../assets/iconMap.jsx";
import { useNavigate } from "react-router-dom";

const scrollToSection = (id) => {
  if (typeof window === 'undefined') return;
  const container = document.getElementById('sections');
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({behavior: 'smooth', block: 'end'});
};

const onClickLiveDemoBtn = (projectUrl) => {
    if (projectUrl === "") {
        window.alert("No Live Demo available for this project. See video for more info");
    }
    else {
        window.open(projectUrl, '_blank', 'noopener,noreferrer')
    }
}

function ProjectCard({project}) {
    const navigate = useNavigate();

    return (
        <div className="project-card-container">
            <div className="project-preview">
                <img src={project.img} className="project-preview-img"></img>
            </div>
            <h1>
                {project.name}
            </h1>

            <p>
                {project.description}
            </p>
            <div className="project-card-actions">
                <button 
                    className="project-card-live-demo"
                    onClick={() => onClickLiveDemoBtn(project.url)}
                >
                    Live Demo
                </button>

                <button className="project-card-details"
                    onClick={() => navigate(`/projects/${project.id}`)}
                >
                    Details
                </button>
            </div>
        </div>
    )
}

function SelectionBar({selected, onChange}) {
    return (
        <div className="selection-bar-container">
            <button 
                onClick={() => onChange('projects')}
                className = {selected === "projects" ? 'sel-btn-active' : 'sel-btn'}
            >
                <div className="projects-button-portfolio">
                    <FaCode style={{ marginRight: '10', transform: 'scale(0.9) translateY(2px)' }} />
                    Projects
                </div>
            </button>
            <button 
                onClick={() => onChange('skills')}
                className = {selected === "skills" ? 'sel-btn-active' : 'sel-btn'}
            >
                <div className="skills-button-portfolio">
                    <FaLayerGroup style={{ marginRight: '10', transform: 'scale(0.9) translateY(2px)' }} />
                    Skills
                </div>
            </button>
        </div>
    );
}

function ProjectsBar({projects, lastProjectCard}) {
    return (
        <div className="projects-grid">
            {projects.map(p => (
                <ProjectCard key={p.id} project={p} />
            ))}

            <div ref={lastProjectCard} style={{height: "1px"}} id="lastProject"></div> {/* empty div just to check if the last card is visible*/}
        </div>
    );
}

function SkillsBar({skills, lastSkill}) {
    return (
        <div className="skills-container">
            {skills.map(skillCategory => (
                <SkillsCard key={skillCategory.id} skillCategory={skillCategory} />
            ))}
            <div ref={lastSkill} style={{height: "1px"}} id="lastSkill"></div> {/* empty div just to check if the last card is visible*/}
        </div>
    );
}

function SkillsCard({skillCategory}) {
    return (
        <div className="skill-category-container">
            <div className="skill-category-name">{skillCategory.name}</div>
            <div className="skills">
            {skillCategory.list.map(skill => 
                <SkillCard skill={skill} key={skill} />
            )}
            </div>
        </div>
    );
}

function SkillCard({skill}) {
    const Icon = skillIconMap[skill.toLowerCase()];
    return (
        <div className="skill-card">
            {Icon}
            <h1 className="skill-name">{skill}</h1>
        </div>  
    )
}

function ShowMoreBtn({selected}) {
    let scrollSelect = "";
    if (selected === 'projects')
    {
        scrollSelect = "lastProject";
    }
    else {
        scrollSelect = "lastSkill";
    }
    return (
        <button className="show-more-btn"
        onClick = {() => scrollToSection(scrollSelect)}>
            <FaCaretDown className="bounce" />
        </button>
    );
}

export default function Projects() {
    const [selected, setSelected] = useState('projects');
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

    const lastProjectCard = useRef(null);
    const lastSkill = useRef(null);
    const [showMoreBtn, setShowMoreBtn] = useState(true);
    useEffect(() => {
        const rootEl = document.querySelector('.sections');
        const el = lastProjectCard.current;
        const skillEl = lastSkill.current;
        if (selected==='projects' && (!el || !rootEl)) return;
        if (selected==='skills' && (!skillEl || !rootEl)) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowMoreBtn(false);
                }
                else {
                    setShowMoreBtn(true);
                }
            },
            { root:rootEl, threshold: 1 }
        );
        if (selected === 'projects') {
            observer.observe(el);
        }
        else 
        {
            observer.observe(skillEl);
        }
        return () => observer.disconnect();
    }, [selected]);

    return (
        <section className="portfolio-section" ref={sectionRef}>
            <div className={`portfolio-container ${show ? 'show' : ''}`}>
                <h1 className="portfolio-title">Portfolio</h1>

                <SelectionBar selected={selected} onChange={setSelected} />

                {selected === 'projects' ? <ProjectsBar projects={projects} lastProjectCard={lastProjectCard}/> : <SkillsBar skills={skills} lastSkill={lastSkill}/>}
            </div>
            {show && showMoreBtn ? <ShowMoreBtn selected={selected}/> : null}
        </section>
    );
}