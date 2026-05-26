/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cream: {
          DEFAULT: "#FFF5E8",
          light: "#FFF8F0",
          dark: "#FFE8D0",
          warm: "#FFEDD8",
        },
        pink: {
          soft: "#FFB7C5",
          light: "#FFD6E0",
          border: "#FFC4D1",
          focus: "#FF8FAB",
          active: "#FF7096",
          200: "#FFD6E0",
          300: "#FFB7C5",
          400: "#FF8FAB",
          500: "#FF7096",
        },
        brown: {
          DEFAULT: "#5C4033",
          light: "#8B6F5E",
          mid: "#A08472",
        },
        beige: {
          DEFAULT: "#F5E6D3",
          light: "#FFF0E0",
        },
        accent: {
          purple: { 300: "#D4A5D8", 400: "#C78FCB", 500: "#B57BB8" },
          orange: { 300: "#FFD6A5", 400: "#FFC07A", 500: "#FFB04F" },
          green:  { 200: "#B8E0D0", 400: "#8CCFB8" },
          blue:   { 200: "#B8D4E8", 400: "#8CB8D8" },
        },
      },
      fontFamily: {
        serif: ["'Noto Serif SC'", "PingFang SC", "Microsoft YaHei", "serif"],
        sans: ["'Noto Sans SC'", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "4xl": "3rem",
        pill: "9999px",
        full: "50%",
        kawaii: "2rem",
        photo: "1.2rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        "card": "0 8px 32px rgba(255, 183, 197, 0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
        "card-hover": "0 12px 40px rgba(255, 183, 197, 0.28), inset 0 1px 0 rgba(255,255,255,0.8)",
        "polaroid": "0 6px 24px rgba(160, 120, 90, 0.15), 0 2px 4px rgba(160, 120, 90, 0.08)",
        "kawaii": "0 4px 20px rgba(255, 183, 197, 0.2), inset 0 1px 0 rgba(255,255,255,0.7)",
        "kawaii-hover": "0 8px 30px rgba(255, 183, 197, 0.3), inset 0 1px 0 rgba(255,255,255,0.7)",
        "soft": "0 2px 12px rgba(160, 120, 90, 0.1)",
        "inset": "inset 0 2px 8px rgba(160, 120, 90, 0.06)",
        "tape": "0 2px 6px rgba(160, 120, 90, 0.12)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bounce-scroll": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "50%": { transform: "translateY(-6px) rotate(3deg) scale(1.05)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-scroll": "bounce-scroll 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "wiggle": "wiggle 2.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
