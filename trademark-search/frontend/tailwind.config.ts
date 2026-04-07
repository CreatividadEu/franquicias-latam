import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#ecf4ff",
        skyline: "#0f4c81",
        accent: "#ff7a59",
        jade: "#0f766e"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(15, 76, 129, 0.16)"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"]
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(15, 76, 129, 0.22), transparent 30%), linear-gradient(180deg, #f7fbff 0%, #edf4ff 48%, #ffffff 100%)"
      }
    }
  },
  plugins: []
};

export default config;
