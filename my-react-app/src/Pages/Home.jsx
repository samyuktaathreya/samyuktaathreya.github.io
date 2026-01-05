
import {useRef, useEffect} from 'react';

function findTarget(baseX, baseY, mouseX, mouseY, alpha) {
  // vector from base point to mouse
  let dx = mouseX - baseX;
  let dy = mouseY - baseY;

  let distSq = dx*dx + dy*dy;
  let dist = Math.sqrt(distSq);

  if (dist < 0.0001) {
    return { x: baseX, y: baseY }  // no movement
  }

  // controls falloff with distance (smaller => stronger at distance)
  let k = 800;
  let strength = alpha * (1 / (distSq + k));

  // normalize direction (unit vector)
  let ux = dx / dist
  let uy = dy / dist

  // convert strength into a pixel offset
  // maxWarp caps the effect; scale adjusted for large viewports
  let maxWarp = 160; // tune this (pixels)
  let offset = Math.min(maxWarp, strength * 250000); // scaling factor to get usable pixels

  let targetX = baseX + ux * offset
  let targetY = baseY + uy * offset
  return { x: targetX, y: targetY }
}

function buildPolylineStrings(smoothX, smoothY, cols, rows, horizontal, vertical) {

  //horizontal lines (constant Y, varying X)
  for (let j = 0; j < rows; j++) {
    let parts = [];

    for (let i = 0; i < cols; i++) {
      const idx = j * cols + i;
      parts.push(`${smoothX[idx]},${smoothY[idx]}`);
    }

    horizontal[j] = parts.join(' ');
  }

  // vertical lines (constant X, varying Y)
  for (let i = 0; i < cols; i++) {
    let parts = [];

    for (let j = 0; j < rows; j++) {
      const idx = j * cols + i;
      parts.push(`${smoothX[idx]},${smoothY[idx]}`);
    }

    vertical[i] = parts.join(' ');
  }

  return { horizontal, vertical };
}


export default function Home() {
  const svgRef = useRef(null);
  // smoothing factor for the animation (higher => faster, stronger pull)
  const alpha = 0.12;

  const rows = 9;
  const cols = 9;
  const spacing = 60;

  //SVG width and height
  const width = (cols - 1) * spacing;
  const height = (rows - 1) * spacing;

  const pointsX = Array.from({ length: cols }, (_, i) => i * spacing);
  const pointsY = Array.from({ length: rows }, (_, i) => i * spacing);

  const total = rows * cols;
  const targetX = useRef(new Array(total).fill(0));
  const targetY = useRef(new Array(total).fill(0));

  const smoothX = useRef(new Array(total).fill(0));
  const smoothY = useRef(new Array(total).fill(0));

  // base and overlay refs so we can show a lighter overlay near the mouse
  const baseHorizontalRefs = useRef(Array(rows).fill(null));
  const baseVerticalRefs = useRef(Array(cols).fill(null));

  const overlayHorizontalRefs = useRef(Array(rows).fill(null));
  const overlayVerticalRefs = useRef(Array(cols).fill(null));

  const gradientRef = useRef(null);

  // initialize to base grid
  useEffect(() => {
    let idx = 0;
    for (let j = 0; j < pointsY.length; j++) {
      for (let i = 0; i < pointsX.length; i++) {
        smoothX.current[idx] = pointsX[i];
        smoothY.current[idx] = pointsY[j];
        idx++;
      }
    }
  }, []);
  
  const runningRef = useRef(false);
  const rafRef = useRef(null);

  const onMouseMove = (evt) => {
    // convert mouse to SVG coords
    const { x: mouseX, y: mouseY } = convertClientToSvgCoords(evt.clientX, evt.clientY);

    // move the radial gradient used by the mask so overlay brightens near mouse
    if (gradientRef.current) {
      gradientRef.current.setAttribute('cx', mouseX);
      gradientRef.current.setAttribute('cy', mouseY);
      // radius roughly a third of the diagonal
      const r = Math.max(width, height) * 0.5;
      gradientRef.current.setAttribute('r', r);
    }

    // allocate new target arrays
    const nextTargetX = new Array(total);
    const nextTargetY = new Array(total);

    let idx = 0;

    for (let j = 0; j < rows; j++) {
      const baseY = pointsY[j];

      for (let i = 0; i < cols; i++) {
        const baseX = pointsX[i];

        const t = findTarget(
          baseX,
          baseY,
          mouseX,
          mouseY,
          alpha
        );

        nextTargetX[idx] = t.x;
        nextTargetY[idx] = t.y;

        idx++;
      }
    }

    // write once to refs (no rerender)
    targetX.current = nextTargetX;
    targetY.current = nextTargetY;

    // start animation loop if not running
    if (!runningRef.current) {
      startAnimationLoop();
    }
  };

  function convertClientToSvgCoords(x,y) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    // create an SVG point in screen space
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;

    // transform into SVG coordinate system
    const svgPt = pt.matrixTransform(
      svg.getScreenCTM().inverse()
    );

    return { x: svgPt.x, y: svgPt.y };
  }

  function startAnimationLoop() {
    runningRef.current = true;

    function tick() {
      let done = true;

      for (let i = 0; i < smoothX.current.length; i++) {
        const sx = smoothX.current[i];
        const sy = smoothY.current[i];

        const tx = targetX.current[i];
        const ty = targetY.current[i];

        const nx = sx + (tx - sx) * alpha;
        const ny = sy + (ty - sy) * alpha;

        smoothX.current[i] = nx;
        smoothY.current[i] = ny;

        if (Math.abs(tx - nx) > 0.01 || Math.abs(ty - ny) > 0.01) {
          done = false;
        }
      }

      const horizontal = new Array(rows);
      const vertical = new Array(cols);

      buildPolylineStrings(
        smoothX.current,
        smoothY.current,
        cols,
        rows,
        horizontal,
        vertical
      );

      for (let j = 0; j < rows; j++) {
          // update base + overlay horizontal lines
          const baseEl = baseHorizontalRefs.current[j];
          if (baseEl) baseEl.setAttribute('points', horizontal[j]);
          const overEl = overlayHorizontalRefs.current[j];
          if (overEl) overEl.setAttribute('points', horizontal[j]);
      }

      for (let i = 0; i < cols; i++) {
        const baseEl = baseVerticalRefs.current[i];
        if (baseEl) baseEl.setAttribute('points', vertical[i]);
        const overEl = overlayVerticalRefs.current[i];
        if (overEl) overEl.setAttribute('points', vertical[i]);
      }

      if (!done) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="home-container">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        onMouseMove={onMouseMove}
      >
          <defs>
            <radialGradient id="mouseSpot" ref={gradientRef} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <mask id="mouseMask">
              <rect x="0" y="0" width={width} height={height} fill="url(#mouseSpot)" />
            </mask>
          </defs>

          {/* base darker grid */}
          <g className="grid-base">
            {baseHorizontalRefs.current.map((_, j) => (
              <polyline
                key={`base-h-${j}`}
                ref={el => (baseHorizontalRefs.current[j] = el)}
                fill="none"
              />
            ))}

            {baseVerticalRefs.current.map((_, i) => (
              <polyline
                key={`base-v-${i}`}
                ref={el => (baseVerticalRefs.current[i] = el)}
                fill="none"
              />
            ))}
          </g>

          {/* overlay brighter grid revealed by mask near mouse */}
          <g className="grid-overlay" mask="url(#mouseMask)">
            {overlayHorizontalRefs.current.map((_, j) => (
              <polyline
                key={`over-h-${j}`}
                ref={el => (overlayHorizontalRefs.current[j] = el)}
                fill="none"
              />
            ))}

            {overlayVerticalRefs.current.map((_, i) => (
              <polyline
                key={`over-v-${i}`}
                ref={el => (overlayVerticalRefs.current[i] = el)}
                fill="none"
              />
            ))}
          </g>
      </svg>
    </div>
  );
}