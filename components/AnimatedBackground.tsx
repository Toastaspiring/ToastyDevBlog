import React, { useRef, useEffect, useCallback } from 'react';
import styles from './AnimatedBackground.module.css';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

const PARTICLE_COUNT = 120;
const COLORS = [
  'rgba(255, 255, 255, 0.9)',
  'rgba(255, 255, 255, 0.7)',
  'rgba(240, 240, 255, 0.8)',
];

export const AnimatedBackground: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1, // 1-3px radius for rain effect
        vx: (Math.random() - 0.5) * 0.6, // slight horizontal drift -0.3 to 0.3
        vy: Math.random() * 2 + 1, // falling speed 1-3
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Boundary check - respawn at top when reaching bottom
      if (p.y > canvas.height + p.radius) {
        p.y = -p.radius;
        p.x = Math.random() * canvas.width;
      }
      // Wrap horizontally if needed
      if (p.x < -p.radius) p.x = canvas.width + p.radius;
      if (p.x > canvas.width + p.radius) p.x = -p.radius;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.closePath();
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles(canvas.width, canvas.height);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [animate, createParticles]);

  return <canvas ref={canvasRef} className={`${styles.backgroundCanvas} ${className ?? ''}`} />;
};