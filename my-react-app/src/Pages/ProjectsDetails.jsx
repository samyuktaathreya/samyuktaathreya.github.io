import React from "react";
import { useParams, Link, useNavigate} from "react-router-dom";
import projects from "../assets/projects.json";

function isYouTubeUrl(url = "") {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toYouTubeEmbed(url = "") {
  // handles https://www.youtube.com/watch?v=XXXX and https://youtu.be/XXXX
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function goHomeAndScroll(id, navigate) {
  navigate("/");
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, 100);
}


export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = projects.find((p) => String(p.id) === String(id));

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Project not found</h1>
        <Link to="/">← Back</Link>
      </div>
    );
  }

  const video = project.video || project.videoUrl || "";

  return (
    <div className="projects-details-page" style={{ padding: 24 }}>
        <div className="project-details-container">
            <div className="project-details-top">
            <button
                className="back-link"
                onClick={() => goHomeAndScroll("projects", navigate)}
            >
                ← Back
            </button>

            <h1 className="project-details-title">{project.name}</h1>

            <div className="project-details-spacer" />
            </div>


      <div style={{ marginTop: 16 }}>
        {/* VIDEO SECTION */}
        {video ? (
          isYouTubeUrl(video) ? (
            <div style={{ maxWidth: 900 }}>
              <iframe
                width="100%"
                height="480"
                src={toYouTubeEmbed(video)}
                title={`${project.name} video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              controls
              className="project-detail-video"
              src={video}
            />
          )
        ) : (
          <p>No video available.</p>
        )}
      </div>

      {/* LINKS */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>

        {project.github ? (
          <a className="btn" href={project.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        ) : null}
      </div>

      {/* DESCRIPTION */}
      <div style={{ marginTop: 16, maxWidth: 900 }}>
        <p className="project-desc">{project.longDescription || project.description}</p>
      </div>
      </div>
    </div>
  );
}
