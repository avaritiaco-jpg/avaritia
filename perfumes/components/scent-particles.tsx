"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  r: number;
  vy: number;
  amp: number;
  freq: number;
  phase: number;
  alpha: number;
  twinkle: number;
  pushX: number;
  pushY: number;
};

// Poeira dourada subindo devagar, como notas de perfume no ar.
// Canvas 2D com sprite pré-renderizado; pausa fora da tela e com a aba oculta.
export function ScentParticles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    // sprite: ponto de luz âmbar com halo suave
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255, 228, 176, 1)");
    g.addColorStop(0.18, "rgba(236, 196, 128, 0.85)");
    g.addColorStop(0.45, "rgba(214, 163, 92, 0.25)");
    g.addColorStop(1, "rgba(214, 163, 92, 0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);

    const motes: Mote[] = [];
    const count = window.innerWidth < 768 ? 34 : 72;
    const pointer = { x: -9999, y: -9999 };

    const spawn = (m: Partial<Mote> = {}, anywhere = false): Mote => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20 + Math.random() * 60,
      r: 0.6 + Math.random() ** 2 * 2.6,
      vy: 0.12 + Math.random() * 0.42,
      amp: 6 + Math.random() * 22,
      freq: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.6,
      twinkle: 0.6 + Math.random() * 1.6,
      pushX: 0,
      pushY: 0,
      ...m,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    for (let i = 0; i < count; i++) motes.push(spawn({}, true));

    let raf = 0;
    let running = false;
    let last = performance.now();

    const draw = (t: number) => {
      const dt = Math.min(48, t - last) / 16.67;
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y -= m.vy * dt;
        // o cursor afasta as partículas, como mão passando pela névoa
        const dx = m.x - pointer.x;
        const dy = m.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 140) * 2.2;
          m.pushX += (dx / d) * f;
          m.pushY += (dy / d) * f;
        }
        m.pushX *= 0.94;
        m.pushY *= 0.94;
        m.x += m.pushX * 0.25 * dt;
        m.y += m.pushY * 0.25 * dt;

        const x = m.x + Math.sin(t * 0.0006 * m.freq + m.phase) * m.amp;
        const fade = Math.min(1, m.y / (h * 0.35)) * Math.min(1, (h - m.y + 40) / 120);
        const a = m.alpha * fade * (0.55 + 0.45 * Math.sin(t * 0.0012 * m.twinkle + m.phase));
        if (a > 0.01) {
          const size = m.r * 9;
          ctx.globalAlpha = a;
          ctx.drawImage(sprite, x - size / 2, m.y - size / 2, size, size);
        }
        if (m.y < -30) motes[i] = spawn();
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduce) draw(performance.now());

    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none ${className}`} aria-hidden />;
}
