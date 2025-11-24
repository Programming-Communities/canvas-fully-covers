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

    // Proper canvas sizing - FULL SCREEN
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial resize
    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Particle class with header-like colors
    class Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      angle: number;
      canvas: HTMLCanvasElement;
      isRedParticle: boolean; // ✅ FIXED: Removed private modifier

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2.5 + 1;
        this.speed = Math.random() * 0.4 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.isRedParticle = Math.random() < 0.3; // 30% red particles
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
          // Dark theme colors - like header dark theme
          if (this.isRedParticle) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'; // Red-500 with opacity
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White particles
          }
        } else {
          // Light theme colors - like header light theme
          if (this.isRedParticle) {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.5)'; // Red-600 with opacity
          } else {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // Blue particles
          }
        }
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const numParticles = 100; // More particles for richer effect

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(canvas));
    }

    // Connect particles with gradient colors
    const connectParticles = (isDark: boolean) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 1 - (distance / 120);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            if (isDark) {
              // Dark theme connections - cosmic red/white
              if (particles[i].isRedParticle || particles[j].isRedParticle) {
                ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.2})`;
              } else {
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
              }
            } else {
              // Light theme connections - blue/red
              if (particles[i].isRedParticle || particles[j].isRedParticle) {
                ctx.strokeStyle = `rgba(220, 38, 38, ${opacity * 0.15})`;
              } else {
                ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.1})`;
              }
            }
            
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    };

    // Create gradient background like header
    const createBackground = (ctx: CanvasRenderingContext2D, isDark: boolean) => {
      if (isDark) {
        // Dark theme gradient - like header dark
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.03)'); // gray-900
        gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.02)'); // blue-900
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0.04)'); // gray-950
        return gradient;
      } else {
        // Light theme gradient - like header light
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(239, 246, 255, 0.02)'); // blue-50
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)'); // white
        gradient.addColorStop(1, 'rgba(248, 250, 252, 0.03)'); // gray-50
        return gradient;
      }
    };

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      const isDark = resolvedTheme === 'dark';
      
      // Clear with gradient background
      const backgroundGradient = createBackground(ctx, isDark);
      ctx.fillStyle = backgroundGradient;
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

    // Start animation only if mounted
    if (isMounted) {
      animate();
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMounted, resolvedTheme]);

  // Server-side rendering ke liye empty return karein
  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: 0.8
      }}
      aria-hidden="true"
    />
  );
};

export default GlobalCanvas;