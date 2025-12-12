/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 반드시 src 안쪽을 스캔하게 해줘야 함
  ],
  safelist: [
    "bg-[#1a1748]",
    "bg-[#c30452]",
    "bg-[#ce0e2d]",
    "bg-[#074ca1]",
    "bg-[#041e42]",
    "bg-[#315288]",
    "bg-[#ea0029]",
    "bg-[#fc4e00]",
    "bg-[#570514]",
    "bg-[#000000]"
  ],
  theme: {
    extend: {
      colors: {
      },
    },
  },
  plugins: [],
};
