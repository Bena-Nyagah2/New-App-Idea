import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ac',
          300: '#f6c075',
          400: '#f1a13d',
          500: '#ed8914',
          600: '#e06d0f',
          700: '#b85010',
          800: '#934014',
          900: '#773514',
        },
      },
    },
  },
  plugins: [],
};

export default config;