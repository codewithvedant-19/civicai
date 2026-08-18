import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: "#E7ECF0",
          surface: "#F4F7FA",
          card: "#FFFFFF",
          line: "#D5DDE6",
          dark: "#0F172A",
        },
        amber: {
          DEFAULT: "#FFC000",
          hover: "#EBB000",
          dim: "#FFF7D6",
        },
        teal: {
          DEFAULT: "#1E3A8A",
          light: "#2563EB",
          dim: "#EBF3FF",
        },
        danger: {
          DEFAULT: "#DC2626",
          dim: "#FEE2E2",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          faint: "#94A3B8",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-playfair)", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "dash-line":
          "repeating-linear-gradient(90deg, currentColor 0 10px, transparent 10px 20px)",
        "blueprint-grid":
          "linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-size": "32px 32px",
      },
    },
  },
  plugins: [],
};
export default config;
