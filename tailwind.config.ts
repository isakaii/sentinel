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
        // Course colors from mockups
        course: {
          purple: "#8B5CF6",
          blue: "#3B82F6",
          red: "#EF4444",
          green: "#10B981",
          orange: "#F59E0B",
          pink: "#EC4899",
          indigo: "#6366F1",
          teal: "#14B8A6",
        },
        // Event type colors
        event: {
          quiz: "#F59E0B",
          assignment: "#10B981",
          exam: "#EF4444",
          reading: "#10B981",
        },
      },
    },
  },
  plugins: [],
};
export default config;
