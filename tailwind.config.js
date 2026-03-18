/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'memoir-bg': '#F6F2EC',   // Beige (Fond)
        'memoir-blue': '#1C5462', // Bleu Paon (Structure)
        'memoir-gold': '#C6A65E', // Or Mat (Valeur)
        'memoir-neon': '#EE135D', // Rose Fluo (Geste)
        'memoir-light': '#F6F2EC', // Alias pour le texte clair (Beige)
        
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        calli: ['var(--font-calli)'],
      },
    },
  },
  plugins: [],
}
