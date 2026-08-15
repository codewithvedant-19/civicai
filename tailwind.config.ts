import type { Config } from "tailwindcss";

// Palette pulled from the real vocabulary of road infrastructure, not a
// decorative dark-mode default: MUTCD safety-sign yellow, route-shield blue,
// thermoplastic lane-paint white, and asphalt greys. Token *names* below are
// kept stable (amber/teal/etc.) so components don't need touching, but the
// hex values are now literally sourced from road signage.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: { DEFAULT: "#14171B", surface: "#1C2027", line: "#2A2F39" },
        amber: { DEFAULT: "#F5B700", dim: "#5C4508" }, // MUTCD warning-sign yellow
        teal: { DEFAULT: "#3E85AE", dim: "#1B384A" }, // interstate route-shield blue
        danger: { DEFAULT: "#E14F4F", dim: "#5C2222" }, // stop-sign red
        ink: { DEFAULT: "#EDEAE0", muted: "#8B93A1", faint: "#585F6C" }, // ink.DEFAULT = lane-paint white
      },
      fontFamily: {
        display: ["'Overpass'", "sans-serif"], // derived from U.S. Highway Gothic road-sign lettering
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "dash-line":
          "repeating-linear-gradient(90deg, currentColor 0 10px, transparent 10px 20px)",
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;

