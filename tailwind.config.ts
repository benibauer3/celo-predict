import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Legacy Celo palette
        celo: {
          green: "#35D07F",
          gold: "#FBCC5C",
          purple: "#6C35D0",
          dark: "#1A1A2E",
        },
        // Uniforest brand palette
        unipink: "#FF007A",
        uniblue: "#007AFF",
        uniforest: {
          bg: "#FAFAFA",
          card: "#FFFFFF",
          border: "#F0F0F5",
          muted: "#9CA3AF",
          text: "#111827",
        },
      },
      backgroundImage: {
        "uni-gradient": "linear-gradient(135deg, #007AFF, #8B5CF6, #FF007A)",
        "uni-yes":      "linear-gradient(135deg, #007AFF, #60A5FA)",
        "uni-no":       "linear-gradient(135deg, #FF007A, #FB7185)",
      },
      boxShadow: {
        "uni-card":  "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "uni-blue":  "0 4px 16px rgba(0,122,255,0.25)",
        "uni-pink":  "0 4px 16px rgba(255,0,122,0.25)",
        "uni-glow":  "0 0 30px rgba(139,92,246,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
