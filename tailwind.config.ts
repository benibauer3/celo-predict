import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        celo: {
          green: "#35D07F",
          gold: "#FBCC5C",
          purple: "#6C35D0",
          dark: "#1A1A2E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
