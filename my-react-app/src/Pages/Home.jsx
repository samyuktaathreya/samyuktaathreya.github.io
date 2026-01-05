import {use, useEffect, useState} from 'react';
import React from 'react';
// function to draw line (returns "x,y")
function drawLine(curX, curY, tarX, tarY, alpha) {
  const newX = curX + (tarX - curX) * alpha;
  const newY = curY + (tarY - curY) * alpha;
  return { curX: newX, curY: newY }; // <-- IMPORTANT: keep as numbers for future grouping
}

// build grid polylines from points
function buildGrid(points) {
  const xs = [...new Set(points.map(p => p.baseX))].sort((a,b)=>a-b);
  const ys = [...new Set(points.map(p => p.baseY))].sort((a,b)=>a-b);

  // for each x: polyline through all y
  const xLines = xs.map(x => {
    const linePts = points
      .filter(p => p.baseX === x)
      .sort((a,b) => a.baseY - b.baseY)
      .map(p => `${p.curX},${p.curY}`)
      .join(" ");
    return linePts;
  });

  // for each y: polyline through all x
  const yLines = ys.map(y => {
    const linePts = points
      .filter(p => p.baseY === y)
      .sort((a,b) => a.baseX - b.baseX)
      .map(p => `${p.curX},${p.curY}`)
      .join(" ");
    return linePts;
  });

  return [...xLines, ...yLines]; // grid = all polylines
}

export default function Home() {
    const alpha = 0.5;
    const initialPoints = React.useMemo(() => {
    const pts = [];
    for (let x = 10; x <= 1000; x += 20) {
        for (let y = 40; y <= 1000; y += 20) {
            pts.push({ baseX: x, baseY: y, curX: x, curY: y });
        }
    }
        return pts;
    }, []);
    const [points, setPoints] = useState(initialPoints);
    const targetRef = React.useRef({ x: 500, y: 500 });
    // create points with baseX/baseY for stable grouping


    const grid = React.useMemo(() => buildGrid(points), [points]);
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 1000;
        targetRef.current = { x, y };
    };
    useEffect(() => {
        let rafId;

        const tick = () => {
            const { x: tarX, y: tarY } = targetRef.current;

            setPoints(prev =>
            prev.map(p => {
                const moved = drawLine(p.curX, p.curY, tarX, tarY, alpha);
                return { ...p, ...moved };
            })
            );

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [alpha]);


    return (
        <svg width="100vw" height="100vh" viewBox="0 0 1000 1000" onMouseMove={handleMouseMove}>
            {grid.map((polyPoints, i) => (
            <polyline
                key={i}
                points={polyPoints}
                fill="none"
                stroke="white"
            />
            ))}
        </svg>
    );
}
