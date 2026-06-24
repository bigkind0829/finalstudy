import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#37352f",
        subtle: "#787774",
        line: "#e9e9e7",
        paper: "#ffffff",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Pretendard", "Apple SD Gothic Neo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
