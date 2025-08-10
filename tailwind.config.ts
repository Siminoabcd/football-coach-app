import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",   // ✅ enable class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [animate],
};

export default config;

