
import {useRef} from 'react';
import {sqrt, min} from 'mathjs';

function findTarget(baseX, baseY, mouseX, mouseY, alpha) {
  // vector from base point to mouse
  let dx = mouseX - baseX;
  let dy = mouseY - baseY;

  let distSq = dx*dx + dy*dy;
  let dist = sqrt(distSq);

  if (dist < 0.0001) {
    return { x: baseX, y: baseY }  // no movement
  }

  let k = 2000  // tune this
  let strength = alpha * (1 / (distSq + k))  // smaller with distance

  // normalize direction (unit vector)
  let ux = dx / dist
  let uy = dy / dist

  // convert strength into a pixel offset
  // maxWarp caps the effect
  let maxWarp = 25 // tune this (pixels)
  let offset = min(maxWarp, strength * 100000) // scaling factor to get usable pixels

  let targetX = baseX + ux * offset
  let targetY = baseY + uy * offset
  return { x: targetX, y: targetY }
}

export default function Home() {
  const alpha = 0.05;

  const pointsX = Array.from({ length: 9 }, (_, i) => i * 40);
  const pointsY = Array.from({ length: 9 }, (_, i) => i * 40);

  const targetX = useRef(pointsX.slice());
  const targetY = useRef(pointsY.slice());

  const onMouseMove = (evt) => {
    // convert mouse to SVG coords
    const { x: mouseX, y: mouseY } = convertClientToSvgCoords(evt);

    const cols = pointsX.length;
    const rows = pointsY.length;
    const total = cols * rows;

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

  return (
    <>

    </>
  );
}