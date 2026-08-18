import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: "#EEF2F6",
          surface: "#F7F9FB",
          card: "#FFFFFF",
          line: "#DDE4EC",
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
        display: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.08)",
        "card-hover": "0 2px 4px 0 rgba(15, 23, 42, 0.06), 0 12px 28px -6px rgba(15, 23, 42, 0.14)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
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
