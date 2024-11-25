import appTheme from '@snippy/ui/tailwind.config';

function generateColors(name) {
  return Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [
      index + 1,
      `hsl(var(--${name}-${index + 1}))`,
    ]),
  );
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,vue,ts}', '../../packages/ui/src/**/*.{js,vue,ts}'],
  theme: {
    extend: {
      colors: {
        lime: generateColors('lime'),
        olive: generateColors('olive'),
      },
    },
  },
  presets: [appTheme],
};
