"use client";

import { motion } from "framer-motion";

interface Props {
  size?: number;
  animated?: boolean;
}

export function UnicornLogo({ size = 44, animated = true }: Props) {
  const Wrap = animated ? motion.div : "div";
  const animProps = animated
    ? {
        animate: { scale: [1, 1.04, 1], rotate: [0, 1, -1, 0] },
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  return (
    <Wrap
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      {...animProps}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          background: "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)",
          filter: `blur(${size * 0.25}px)`,
          transform: "scale(1.15)",
        }}
      />

      {/* Main container */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #007AFF 0%, #8B5CF6 50%, #FF007A 100%)" }}
      >
        {/* Forest shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)",
          }}
        />

        {/* Unicorn SVG */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size * 0.72, height: size * 0.72, position: "relative", zIndex: 1 }}
        >
          {/* Horn */}
          <path d="M21 4 L19 12 L23 12 Z" fill="#FBCC5C" opacity="0.95" />
          <path d="M21 4 L20 8 L22 8 Z" fill="#F59E0B" />

          {/* Head */}
          <ellipse cx="22" cy="17" rx="7" ry="6" fill="white" opacity="0.95" />

          {/* Mane */}
          <path d="M16 13 Q10 11 9 17 Q10 14 14 16" stroke="#FF007A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M15 16 Q9 15 9 21 Q10 18 14 19" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Eye */}
          <circle cx="24" cy="16" r="1.5" fill="#007AFF" />
          <circle cx="24.5" cy="15.5" r="0.5" fill="white" />

          {/* Nostril */}
          <ellipse cx="27.5" cy="19" rx="0.8" ry="0.5" fill="#FDA4AF" />

          {/* Body */}
          <ellipse cx="19" cy="29" rx="9" ry="7" fill="white" opacity="0.9" />

          {/* Legs */}
          <line x1="13" y1="34" x2="12" y2="39" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <line x1="17" y1="35" x2="16" y2="39" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <line x1="22" y1="35" x2="23" y2="39" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <line x1="26" y1="34" x2="27" y2="39" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />

          {/* Tail */}
          <path d="M28 28 Q34 24 33 30 Q32 24 28 28" stroke="#FF007A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M28 30 Q35 27 34 33" stroke="#8B5CF6" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Stars */}
          <text x="4"  y="10" fontSize="5" fill="#FBCC5C" opacity="0.9">✦</text>
          <text x="30" y="9"  fontSize="3.5" fill="#FF007A" opacity="0.9">✧</text>
          <text x="2"  y="28" fontSize="3" fill="#007AFF" opacity="0.8">⋆</text>
          <text x="32" y="22" fontSize="4" fill="#A78BFA" opacity="0.9">✺</text>
        </svg>
      </div>
    </Wrap>
  );
}

/* Wordmark */
export function UniforesWordmark({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";
  return (
    <span className={`font-black tracking-tight ${cls}`}>
      <span className="uni-gradient-text">Uni</span>
      <span className="text-gray-800">forest</span>
    </span>
  );
}
