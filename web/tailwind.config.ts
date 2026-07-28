import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "yt-bg": "#0f0f0f",
        "yt-surface": "#212121",
        "yt-raised": "#272727",
        "yt-hover": "#3f3f3f",
        "yt-border": "#303030",
        "yt-text": "#f1f1f1",
        "yt-sub": "#aaaaaa",
        "yt-red": "#ff0033",
        "yt-blue": "#3ea6ff",
      },
    },
  },
  plugins: [],
};
export default config;
