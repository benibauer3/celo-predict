"use client";

import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  /** Diameter of the circular icon in px */
  size?: number;
  /** Whether the icon floats/breathes */
  animated?: boolean;
  /** Whether to render the "Suerte Market" wordmark below the icon */
  showText?: boolean;
  /** Text size variant */
  textSize?: "sm" | "md" | "lg" | "xl";
}

// ─────────────────────────────────────────────────────────────────────────────
//  Front-facing SVG Unicorn (viewBox 0 0 100 100)
//  Layers (back → front):
//    1. Mane strands  2. Ears  3. Head  4. Horn  5. Face details  6. Sparkles
// ─────────────────────────────────────────────────────────────────────────────
function UnicornFace({ size }: { size: number }) {
  const s = size * 0.78; // icon occupies 78% of the circle
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: s, height: s, position: "relative", zIndex: 1 }}
      aria-hidden
    >
      <defs>
        {/* Horn gradient – gold tip → amber base */}
        <linearGradient id="sg-horn" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#FEF3C7" />
          <stop offset="60%"  stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Radial shimmer inside the eye */}
        <radialGradient id="sg-eye-l" cx="40%" cy="40%">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
        <radialGradient id="sg-eye-r" cx="40%" cy="40%">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
      </defs>

      {/* ── 1. MANE (drawn behind head) ─────────────────────────────── */}
      {/* Far-left strand – hot pink */}
      <path
        d="M36,40 C28,34 22,24 20,14 C18,6 23,4 27,7
           C25,14 27,22 31,29 C33,33 35,37 36,40 Z"
        fill="#FF007A" opacity="0.92"
      />
      {/* Mid-left strand – violet */}
      <path
        d="M42,35 C38,26 36,16 38,7 C39,2 43,2 44,7
           C43,14 44,22 45,31 L42,35 Z"
        fill="#A855F7" opacity="0.88"
      />
      {/* Mid-right strand – royal blue */}
      <path
        d="M58,35 C62,26 64,16 62,7 C61,2 57,2 56,7
           C57,14 56,22 55,31 L58,35 Z"
        fill="#007AFF" opacity="0.88"
      />
      {/* Far-right strand – light pink */}
      <path
        d="M64,40 C72,34 78,24 80,14 C82,6 77,4 73,7
           C75,14 73,22 69,29 C67,33 65,37 64,40 Z"
        fill="#F472B6" opacity="0.85"
      />

      {/* ── 2. EARS ─────────────────────────────────────────────────── */}
      {/* Left ear outer */}
      <path d="M27,47 L23,29 L38,43" fill="white" opacity="0.96" />
      {/* Left inner ear */}
      <path d="M28,45 L25,32 L36,43" fill="#FCA5B8" opacity="0.65" />

      {/* Right ear outer */}
      <path d="M73,47 L77,29 L62,43" fill="white" opacity="0.96" />
      {/* Right inner ear */}
      <path d="M72,45 L75,32 L64,43" fill="#FCA5B8" opacity="0.65" />

      {/* ── 3. HEAD ─────────────────────────────────────────────────── */}
      <ellipse cx="50" cy="61" rx="27" ry="24" fill="white" opacity="0.97" />

      {/* ── 4. HORN ─────────────────────────────────────────────────── */}
      {/* Main horn body */}
      <path d="M50,7 L44,34 L56,34 Z" fill="url(#sg-horn)" />
      {/* Twist lines on horn */}
      <path
        d="M50,10 C49,16 47,24 46,32"
        stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"
        strokeLinecap="round" fill="none"
      />
      <path
        d="M50,14 C51,20 53,27 54,32"
        stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"
        strokeLinecap="round" fill="none"
      />

      {/* ── 5. FACE DETAILS ─────────────────────────────────────────── */}
      {/* Left eye */}
      <circle cx="39" cy="59" r="7"   fill="#0F172A" />
      <circle cx="39" cy="59" r="5"   fill="url(#sg-eye-l)" />
      <circle cx="37" cy="57" r="2.2" fill="white" opacity="0.92" />
      <circle cx="41.5" cy="61" r="0.9" fill="white" opacity="0.45" />

      {/* Right eye */}
      <circle cx="61" cy="59" r="7"   fill="#0F172A" />
      <circle cx="61" cy="59" r="5"   fill="url(#sg-eye-r)" />
      <circle cx="59" cy="57" r="2.2" fill="white" opacity="0.92" />
      <circle cx="63.5" cy="61" r="0.9" fill="white" opacity="0.45" />

      {/* Snout area */}
      <ellipse cx="50" cy="72" rx="12" ry="8.5" fill="rgba(255,182,193,0.18)" />
      {/* Nostrils */}
      <ellipse cx="45" cy="73" rx="2.4" ry="1.8" fill="rgba(220,100,140,0.38)" />
      <ellipse cx="55" cy="73" rx="2.4" ry="1.8" fill="rgba(220,100,140,0.38)" />

      {/* Blush cheeks */}
      <ellipse cx="29" cy="66" rx="5.5" ry="3.5" fill="rgba(255,0,122,0.10)" />
      <ellipse cx="71" cy="66" rx="5.5" ry="3.5" fill="rgba(255,0,122,0.10)" />

      {/* ── 6. SPARKLES ─────────────────────────────────────────────── */}
      <text x="5"  y="17" fontSize="7"   fill="rgba(253,224,71,0.95)">✦</text>
      <text x="87" y="14" fontSize="5"   fill="rgba(255,0,122,0.88)">✧</text>
      <text x="7"  y="66" fontSize="4"   fill="rgba(0,122,255,0.75)">⋆</text>
      <text x="88" y="70" fontSize="6"   fill="rgba(168,85,247,0.88)">✺</text>
      <text x="47" y="97" fontSize="3.5" fill="rgba(253,224,71,0.80)">✦</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Wordmark
// ─────────────────────────────────────────────────────────────────────────────
const TEXT_SIZES = {
  sm: { suerte: "text-lg",  market: "text-lg",  sub: "text-[10px]" },
  md: { suerte: "text-2xl", market: "text-2xl", sub: "text-xs"     },
  lg: { suerte: "text-3xl", market: "text-3xl", sub: "text-sm"     },
  xl: { suerte: "text-4xl", market: "text-4xl", sub: "text-base"   },
};

function SuerteWordmark({ textSize = "lg" }: { textSize?: Props["textSize"] }) {
  const t = TEXT_SIZES[textSize ?? "lg"];
  return (
    <div className="text-center space-y-0.5">
      <div className="flex items-baseline justify-center gap-1.5">
        <span
          className={`font-black tracking-tight ${t.suerte}`}
          style={{ color: "#007AFF" }}
        >
          Suerte
        </span>
        <span
          className={`font-black tracking-tight ${t.market}`}
          style={{ color: "#111827" }}
        >
          Market
        </span>
      </div>
      <p className={`${t.sub} font-medium tracking-widest uppercase`}
         style={{ color: "#9CA3AF" }}>
        Prediction · Celo
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main export
// ─────────────────────────────────────────────────────────────────────────────
export function SuerteLogo({
  size      = 120,
  animated  = true,
  showText  = true,
  textSize  = "lg",
}: Props) {
  const Wrap       = animated ? motion.div : "div";
  const floatProps = animated
    ? {
        animate: { y: [0, -6, 0], scale: [1, 1.02, 1] },
        transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Icon ──────────────────────────────────────────────────────── */}
      <Wrap
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
        {...floatProps}
      >
        {/* Outer glow – pink halo */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #007AFF, #FF007A)",
            filter:     `blur(${size * 0.22}px)`,
            transform:  "scale(1.25)",
            opacity:    0.55,
          }}
        />

        {/* Secondary glow – blue inner ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(225deg, #60A5FA, #FF007A)",
            filter:     `blur(${size * 0.10}px)`,
            transform:  "scale(1.06)",
            opacity:    0.35,
          }}
        />

        {/* Circle container */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #007AFF 0%, #6D28D9 45%, #FF007A 100%)",
            boxShadow:  "inset 0 2px 8px rgba(255,255,255,0.25), inset 0 -2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {/* Top-left shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.45) 0%, transparent 55%)",
            }}
          />

          <UnicornFace size={size} />
        </div>
      </Wrap>

      {/* ── Wordmark ──────────────────────────────────────────────────── */}
      {showText && <SuerteWordmark textSize={textSize} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Header variant – horizontal layout (icon + text side by side)
// ─────────────────────────────────────────────────────────────────────────────
export function SuerteLogoHorizontal({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* Small icon – no float animation for nav */}
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden"
        style={{
          width:  size,
          height: size,
          background: "linear-gradient(145deg, #007AFF 0%, #6D28D9 50%, #FF007A 100%)",
          boxShadow: "0 0 12px rgba(0,122,255,0.35), 0 0 6px rgba(255,0,122,0.25)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.4) 0%, transparent 55%)",
          }}
        />
        <div className="w-full h-full flex items-center justify-center">
          <UnicornFace size={size} />
        </div>
      </div>

      {/* Name */}
      <div className="leading-none">
        <span className="font-black text-base tracking-tight" style={{ color: "#007AFF" }}>
          Suerte
        </span>
        <span className="font-black text-base tracking-tight text-gray-900"> Market</span>
      </div>
    </div>
  );
}
