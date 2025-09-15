import type { Config } from "tailwindcss";

const withOpacityValue = (variable: string) => {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}))`;
  };
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: withOpacityValue("--color-bg"),
        elev: withOpacityValue("--color-elev"),
        fg: withOpacityValue("--color-fg"),
        muted: withOpacityValue("--color-muted"),
        primary: {
          DEFAULT: withOpacityValue("--color-primary"),
          50: withOpacityValue("--color-primary-50")
        },
        border: withOpacityValue("--color-border")
      },
      spacing: {
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        focus: "var(--shadow-focus)"
      }
    }
  },
  plugins: []
};

export default config;

