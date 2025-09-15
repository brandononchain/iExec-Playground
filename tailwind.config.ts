import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0C",
        elev: "#121214",
        fg: "#FFFFFF",
        muted: "#8B8D92",
        primary: {
          DEFAULT: "#F5CA04",
          50: "#FEF7C9"
        },
        border: "#1C1C20"
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px"
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,.25)",
        focus: "0 0 0 3px rgba(245,202,4,.4)"
      }
    }
  },
  plugins: []
};

export default config;

