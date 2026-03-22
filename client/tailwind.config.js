module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Mentoria Sublime
        dark:    '#292929',
        brown:   '#3D281C',
        mid:     '#604E44',
        gold: {
          DEFAULT: '#C7AA89',
          light:   '#f2ea9c',
          mid:     '#ab9051',
          dark:    '#8e7028',
        },
        beige:   '#D8D1C1',
        cream:   '#F6F2E7',
        // Mantidos para compatibilidade
        nude: {
          light:  '#F6F2E7',
          medium: '#D8D1C1',
          dark:   '#C7AA89',
        },
        bronze:   '#C7AA89',
        offwhite: '#FFFFFF',
        // Mantidos para compatibilidade
        rose: '#D4A0A0',
        sage: '#7BAE7F',
      },
      fontFamily: {
        display: ['Bride', 'Georgia', 'serif'],
        body:    ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(41,41,41,0.06)',
        card: '0 4px 24px rgba(41,41,41,0.08)',
        gold: '0 0 0 2px #C7AA89',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse_gold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(199,170,137,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(199,170,137,0)' },
        },
        progress: {
          from: { width: '0%' },
          to:   { width: 'var(--progress-width)' },
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.4s ease-out forwards',
        shimmer:       'shimmer 2s infinite',
        'pulse-gold':  'pulse_gold 2s infinite',
        progress:      'progress 0.8s ease-out forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
