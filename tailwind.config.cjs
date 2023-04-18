/** @type {import('tailwindcss').Config} */
require('dotenv').config();
const enablePurge = process.env.ENABLE_PURGE || false;

module.exports = {
  purge: {
    enabled: enablePurge,
    content: ['./src/**/*.html', './src/**/*.scss'],
  },
  important: true,
  content: ['*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
