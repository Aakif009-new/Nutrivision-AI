import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input-background)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        DEFAULT: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
        xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px rgba(0,0,0,0.25)",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
