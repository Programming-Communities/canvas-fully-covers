'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const BlogCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (canvas) {
        // BlogList ke container ke size ke hisaab se
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
      }
    };

    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      angle: number;
      private canvas: HTMLCanvasElement;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speed = Math.random() * 0.2 + 0.05;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > this.canvas.width) {
          this.angle = Math.PI - this.angle;
        }
        if (this.y < 0 || this.y > this.canvas.height) {
          this.angle = -this.angle;
        }

        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
      }

      draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (isDark) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        }
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const numParticles = 30; // Kam particles for performance

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(canvas));
    }

    const connectParticles = (isDark: boolean) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            const opacity = 1 - (distance / 80);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            if (isDark) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
            } else {
              ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.05})`;
            }
            
            ctx.lineWidth = 0.2;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const isDark = resolvedTheme === 'dark';
      
      // Clear with very light transparency
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.01)' : 'rgba(248, 250, 252, 0.01)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx, isDark);
      });

      connectParticles(isDark);

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isMounted) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMounted, resolvedTheme]);

  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: 0.3
      }}
      aria-hidden="true"
    />
  );
};

export default BlogCanvas;