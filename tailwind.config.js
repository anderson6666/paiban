/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        zhihu: {
          blue: '#0066FF',
          'blue-dark': '#0050D9',
          'blue-light': '#E6F0FF',
          ink: '#1A1A1A',
          paper: '#F6F7F8',
          line: '#E5E7EB',
          amber: '#FF9600',
          'amber-light': '#FFF3E0',
        },
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', '"Songti SC"', 'SimSun', 'serif'],
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'paper': '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'paper-hover': '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,102,255,0.08)',
      },
    },
  },
  plugins: [],
};
