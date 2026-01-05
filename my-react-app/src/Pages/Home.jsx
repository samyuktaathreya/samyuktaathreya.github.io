import { useEffect, useRef } from "react";

function flowVector(x, y, frequency = 0.01, strength = 1) {
  const w = Math.random(-1,1)*Math.E**x;
  const t = w / frequency + Math.random(-1,1)*y**3;
  const n = (w + t) / (w**2 + t**2);
  const theta = (n + 1) * 0.5 * Math.PI * 2; // [0, 2π]
  return { vx: Math.cos(theta) * strength, vy: Math.sin(theta) * strength };
}

function buildFlowField(width, height, cell, frequency) {
  const cols = Math.ceil(width / cell) + 2; // pad edges for bilinear
  const rows = Math.ceil(height / cell) + 2;

  const field = new Float32Array(cols * rows * 2); // (vx, vy) pairs

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * cell;
      const y = j * cell;

      const n = Math.random(-1,1); // placeholder for noise function
      const theta = (n + 1) * 0.5 * Math.PI * 2;

      const idx = (j * cols + i) * 2;
      field[idx] = Math.cos(theta);
      field[idx + 1] = Math.sin(theta);
    }
  }

  return { field, cols, rows, cell };
}

function sampleFlowBilinear(flow, x, y) {
  const fx = x / flow.cell;
  const fy = y / flow.cell;

  const x0 = Math.floor(fx),
    y0 = Math.floor(fy);
  const x1 = x0 + 1,
    y1 = y0 + 1;

  const sx = fx - x0,
    sy = fy - y0;

  function get(ix, iy) {
    const cx = Math.max(0, Math.min(flow.cols - 1, ix));
    const cy = Math.max(0, Math.min(flow.rows - 1, iy));
    const idx = (cy * flow.cols + cx) * 2;
    return [flow.field[idx], flow.field[idx + 1]];
  }

  const [v00x, v00y] = get(x0, y0);
  const [v10x, v10y] = get(x1, y0);
  const [v01x, v01y] = get(x0, y1);
  const [v11x, v11y] = get(x1, y1);

  const vx0 = v00x + (v10x - v00x) * sx;
  const vy0 = v00y + (v10y - v00y) * sx;
  const vx1 = v01x + (v11x - v01x) * sx;
  const vy1 = v01y + (v11y - v01y) * sx;

  const vx = vx0 + (vx1 - vx0) * sy;
  const vy = vy0 + (vy1 - vy0) * sy;

  const len = Math.hypot(vx, vy) || 1;
  return { vx: vx / len, vy: vy / len };
}

export default function Home() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    // keep your sanity check
    const { vx, vy } = flowVector(100, 200, 0.02, 100);
    console.log(vx, vy);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    // ---------- settings you can tweak ----------
    const frequency = 0.0065; // flow detail
    const cellSize = 7; // bigger = fewer noise samples
    const particleCount = 10000; // portfolio-impressive
    const speed = 1.35;
    const trailFade = 1; // smaller = longer trails
    const lineWidth = 1;

    // ---------- resize + DPR ----------
    let w = 0,
      h = 0,
      dpr = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // redraw base background after resize
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);
    }

    resize();
    window.addEventListener("resize", resize);

    // ---------- flow field computed ONCE (cheap) ----------
    let flow = buildFlowField(w, h, cellSize, frequency);

    // ---------- particles ----------
    const particles = new Array(particleCount).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      px: 0,
      py: 0,
      life: Math.random() * 200 + 80,
      hue: Math.random() * 360,
    }));

    // nice-ish color cycling without heavy math
    let t = 0;

    // optional: subtle interaction
    let mouseX = w * 0.5,
      mouseY = h * 0.5,
      hasMouse = false;

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      hasMouse = true;
    }
    function onLeave() {
      hasMouse = false;
    }
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    // ---------- draw loop ----------
    function frame() {
      rafRef.current = requestAnimationFrame(frame);

      // fade the previous frame for trails
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(0,0,0,${trailFade})`;
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = "lighter";

      t += 0.002;

      // draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // reset / respawn
        p.life -= 1;
        if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = Math.random() * 220 + 90;
          p.hue = (p.hue + 90 + Math.random() * 180) % 360;
          p.px = p.x;
          p.py = p.y;
        }

        // sample flow (NO noise here; fast)
        const v = sampleFlowBilinear(flow, p.x, p.y);

        // gentle mouse "lens" effect (still cheap)
        let mx = 0,
          my = 0;
        if (hasMouse) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const r2 = dx * dx + dy * dy;
          // only affect within a radius
          if (r2 < 140 * 140) {
            const r = Math.sqrt(r2) || 1;
            const pull = (1 - r / 140) * 0.85;
            mx = (dx / r) * pull;
            my = (dy / r) * pull;
          }
        }

        const vx = (v.vx + mx) * speed;
        const vy = (v.vy + my) * speed;

        p.px = p.x;
        p.py = p.y;

        p.x += vx;
        p.y += vy;

        // color: hue drifts over time for a slick look
        const hue = (p.hue + t * 120) % 360;
        ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.35)`;

        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
    }

    frame();

    // rebuild flow if size changes meaningfully
    const resizeObserver = new ResizeObserver(() => {
      const oldW = w,
        oldH = h;
      resize();
      if (Math.abs(w - oldW) > 2 || Math.abs(h - oldH) > 2) {
        flow = buildFlowField(w, h, cellSize, frequency);
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "70vh", background: "black", borderRadius: 16, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "crosshair",
        }}
      />
    </div>
  );
}
