'use client';
import React, { useEffect, useRef, useState } from 'react';
import Logo from '../shared/Logo';
import Navigation from './Navigation';
import ThemeToggle from '../shared/ThemeToggle';
import SearchBar from '../shared/SearchBar';
import MobileMenu from '../shared/MobileMenu';
import CategoriesNavbar from './CategoriesNavbar';
import SidebarMenu from './SidebarMenu';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Wait for component to mount before running any client-side code
  useEffect(() => {
    setIsMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  // Canvas animation code - only run on client side after mount
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x = 0;
      y = 0;
      radius = 0;
      speed = 0;
      angle = 0;
      private canvas: HTMLCanvasElement;
      private seed: number;

      constructor(canvas: HTMLCanvasElement, seed: number) {
        this.canvas = canvas;
        this.seed = seed;
        this.reset();
      }

      reset() {
        if (!this.canvas) return;
        
        const random = (offset: number = 0) => {
          const x = Math.sin(this.seed + offset) * 10000;
          return x - Math.floor(x);
        };
        
        this.x = random(1) * this.canvas.width;
        this.y = random(2) * this.canvas.height;
        this.radius = random(3) * 3 + 1;
        this.speed = random(4) * 0.5 + 0.2;
        this.angle = random(5) * Math.PI * 2;
      }

      update() {
        if (!this.canvas) return;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > this.canvas.width) this.angle = Math.PI - this.angle;
        if (this.y < 0 || this.y > this.canvas.height) this.angle = -this.angle;
      }

      draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Theme-based colors
        if (isDark) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Blue for light mode
        }
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const numParticles = 100;

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(canvas, i));
    }

    const connectParticles = (isDark: boolean) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 120) {
            const opacity = 1 - distance / 120;
            if (isDark) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            } else {
              ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // Blue for light mode
            }
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const isDark = resolvedTheme === 'dark';
      
      // Theme-based background
      if (isDark) {
        ctx.fillStyle = 'rgba(27, 39, 53, 0.1)'; // Dark cosmic
      } else {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.1)'; // Light cosmic
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw(ctx, isDark);
      });

      connectParticles(isDark);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMounted, resolvedTheme]);

  // Server-side rendering ke liye default dark theme use karein
  const isDark = resolvedTheme === 'dark';

  return (
    <header className={`relative overflow-hidden h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
    }`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 1 }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Main Header */}
        <div className="py-8 px-5 md:px-12 lg:px-28 flex-shrink-0">
          <div className="flex justify-between items-center">
            <Logo />
            <Navigation />
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <SearchBar />
              </div>

              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`hidden md:flex items-center space-x-2 backdrop-blur-sm border px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 min-h-11 ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' 
                    : 'bg-black/10 hover:bg-black/20 border-black/20 text-gray-800'
                }`}
                aria-label="Open main menu"
                aria-expanded={isSidebarOpen}
                aria-controls="sidebar-menu"
              >
                <Menu className="w-4 h-4" />
                <span className="text-sm font-medium">Menu</span>
              </button>
              
              <MobileMenu />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Centered Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center my-12">
            <h1 className={`text-4xl sm:text-6xl font-bold mb-4 leading-tight drop-shadow-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Al-Asr Islamic Service
            </h1>
            <p className={`mt-6 max-w-[740px] mx-auto text-lg leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Islamic services, calendar events, and community programs. Stay updated
              with the latest from Al-Asr Islamic Service.
            </p>
            <div className="flex justify-center mt-8">
              <div className={`backdrop-blur-sm px-8 py-4 rounded-xl shadow-xl border transform hover:scale-105 transition-all duration-300 ${
                isDark 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-black/20 border-black/30 text-gray-800'
              }`}>
                <p className="font-bold text-base">
                  Islamic Calendar • Services • Community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <div className="flex-shrink-0">
          <CategoriesNavbar />
        </div>

        <SidebarMenu 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </header>
  );
};

export default Header;