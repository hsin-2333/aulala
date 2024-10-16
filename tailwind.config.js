const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    //  "./src/**/*.{js,jsx,ts,tsx}"
    "./src/**/*.{js,jsx,ts,tsx}",

    // make sure it's pointing to the ROOT node_module
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // plugins: [],
  plugins: [nextui()],
};
