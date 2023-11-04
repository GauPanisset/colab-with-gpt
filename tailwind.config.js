const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  theme: {
    extend: {
      boxShadow: {
        colab: "0 0 4px 0 rgba(0,0,0,.25)"
      },
      colors: {
        colab: {
          primary: "var(--colab-primary-text-color)",
          background: {
            DEFAULT: "var(--colab-highlighted-surface-color)",
            dark: "var(--code-cell-background)"
          }
        }
      },
      fontFamily: {
        sans: ['"Roboto"', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: []
}
