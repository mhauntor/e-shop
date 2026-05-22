import React, { useEffect, useRef } from 'react';
import { useTheme } from "./ThemeProvider";

export default function VantaBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isActive: boolean }>({ x: 0, y: 0, isActive: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, isActive: true };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const gridSize = 28; // Spacing between dots
    let time = 0;

    // Animation Loop
    const render = () => {
      // User requested "speed relaxing hobe (solo)" - very slow, calming increment
      time += 0.012;

      // Clear canvas
      ctx.fillStyle = theme === 'dark' ? '#020617' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const isMouseActive = mouseRef.current.isActive;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Calculate distance to mouse for interactive spotlight
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Interactive mouse effect radius (200px)
          const mouseEffect = isMouseActive ? Math.max(0, 1 - dist / 200) : 0;

          // Ambient relaxing wave pulsing through the grid
          const wave = Math.sin(x * 0.01 + y * 0.01 + time);

          // Dot size calculation
          const baseSize = 1.2;
          const dotSize = baseSize + wave * 0.4 + mouseEffect * 2.5;

          // Alpha calculation
          const baseAlpha = theme === 'dark' ? 0.25 : 0.35;
          const alpha = baseAlpha + wave * 0.15 + mouseEffect * 0.6;

          ctx.save();
          ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));

          // Color: cyan glow near mouse, subtle slate/indigo for ambient wave
          if (mouseEffect > 0.1) {
            ctx.fillStyle = theme === 'dark' ? '#00f2ff' : '#0284c7';
            if (mouseEffect > 0.5) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = theme === 'dark' ? '#00f2ff' : '#0284c7';
            }
          } else {
            ctx.fillStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
          }

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, dotSize), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 -z-50 w-full h-full pointer-events-none blur-[1.5px] opacity-85 transition-all duration-700"
        style={{ background: theme === 'dark' ? '#020617' : '#f8fafc' }}
      />
      {/* Vignette & Soft Blur Overlay for the dreamy background vibe */}
      <div className="fixed inset-0 -z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(2,6,23,0.5)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_10%,rgba(2,6,23,0.85)_100%)] backdrop-blur-[0.5px]" />
    </>
  );
}
