'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const GlobalCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Client-side mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Don't run on server side
    if (!isMounted || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Proper canvas sizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
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
        this.radius = Math.random() * 3 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Bounce off edges
        if (this.x < 0 || this.x > this.canvas.width) {
          this.angle = Math.PI - this.angle;
        }
        if (this.y < 0 || this.y > this.canvas.height) {
          this.angle = -this.angle;
        }

        // Keep within bounds
        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
      }

      draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (isDark) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        }
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const numParticles = 80; // Slightly fewer for better performance

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(canvas));
    }

    // Connect particles
    const connectParticles = (isDark: boolean) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = 1 - (distance / 150);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            if (isDark) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
            } else {
              ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
            }
            
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      const isDark = resolvedTheme === 'dark';
      
      // Clear canvas with slight transparency for trail effect
      if (isDark) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      } else {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.05)';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx, isDark);
      });

      // Connect particles
      connectParticles(isDark);

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMounted, resolvedTheme]);

  // Don't render canvas on server side
  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: 0.8,
        background: 'transparent'
      }}
      aria-hidden="true"
    />
  );
};

export default GlobalCanvas;