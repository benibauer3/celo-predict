"use client";

import { useEffect, useRef } from "react";

const SYMBOLS = ["✦", "✧", "⋆", "✺", "✵", "✨", "💫", "⭐", "🌟", "✪"];
const COLORS  = ["#FF007A", "#007AFF", "#8B5CF6", "#F472B6", "#60A5FA", "#A78BFA", "#FBCC5C"];

export function SparklesCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const throttleRef  = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function spawn(cx: number, cy: number) {
      if (throttleRef.current) return;
      throttleRef.current = true;
      setTimeout(() => { throttleRef.current = false; }, 55);

      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size   = Math.random() * 14 + 8;
      const dx     = (Math.random() - 0.5) * 70;
      const dy     = -(Math.random() * 70 + 25);

      const el = document.createElement("span");
      el.textContent = symbol;
      el.className   = "sparkle-particle";
      el.style.cssText = `
        left: ${cx}px;
        top: ${cy}px;
        font-size: ${size}px;
        color: ${color};
        text-shadow: 0 0 8px ${color}88;
        --dx: ${dx}px;
        --dy: ${dy}px;
      `;

      container!.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }

    function onMouseMove(e: MouseEvent) { spawn(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent) {
      Array.from(e.touches).forEach(t => spawn(t.clientX, t.clientY));
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden
    />
  );
}
