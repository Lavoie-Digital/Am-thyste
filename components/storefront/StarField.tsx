"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkle: number;
  speed: number;
  hue: number;
}

interface Shooting {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
}

/**
 * Canvas amethyst star field: drifting twinkling purple/white stars + the
 * occasional shooting star. Pure canvas for performance; disabled entirely when
 * the user prefers reduced motion (a static gradient takes over via CSS).
 */
export function StarField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let shooting: Shooting[] = [];
    let raf = 0;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((width * height) / 12000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.25,
        baseAlpha: Math.random() * 0.4 + 0.12,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.05 + 0.008,
        hue: Math.random() > 0.4 ? 270 : 285,
      }));
    };

    const spawnShooting = () => {
      const fromLeft = Math.random() > 0.5;
      shooting.push({
        x: fromLeft ? -50 : width + 50,
        y: Math.random() * height * 0.5,
        len: Math.random() * 120 + 80,
        speed: Math.random() * 6 + 5,
        angle: fromLeft ? Math.PI * 0.12 : Math.PI - Math.PI * 0.12,
        life: 0,
        maxLife: 60,
      });
    };

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        s.twinkle += 0.012;
        s.y += s.speed;
        if (s.y > height + 2) {
          s.y = -2;
          s.x = Math.random() * width;
        }
        const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        // Desaturated, mostly-white starlight with the faintest mauve cast.
        ctx.fillStyle = `hsla(${s.hue}, 35%, 88%, ${alpha})`;
        ctx.shadowColor = `hsla(${s.hue}, 45%, 78%, ${alpha * 0.6})`;
        ctx.shadowBlur = s.r * 2.2;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // shooting stars
      shooting = shooting.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shooting) {
        sh.life += 1;
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        const fade = 1 - sh.life / sh.maxLife;
        const tailX = sh.x - Math.cos(sh.angle) * sh.len;
        const tailY = sh.y - Math.sin(sh.angle) * sh.len;
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(236, 228, 244, ${0.55 * fade})`);
        grad.addColorStop(1, "rgba(191, 174, 203, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      if (t % 480 === 0 && Math.random() > 0.5) spawnShooting();

      if (running) raf = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 35%, 88%, ${s.baseAlpha})`;
        ctx.fill();
      }
    };

    resize();
    drawStatic();

    let running = false;
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while the hero is on screen — frees the main thread on scroll.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
