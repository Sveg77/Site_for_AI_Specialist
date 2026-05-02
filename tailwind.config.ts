import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f7f6",
          100: "#dcecea",
          600: "#1d4241",
          700: "#163433"
        }
      }
    }
  },
  plugins: []
};

export default config;
