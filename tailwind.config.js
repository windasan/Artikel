/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        coral:   { DEFAULT: '#F08060', light: '#FCE8DF', dark: '#C05030' },
        sage:    { DEFAULT: '#7BA68A', light: '#E4F0E8', dark: '#3D7050' },
        sky:     { DEFAULT: '#6DAEC4', light: '#DFF0F6', dark: '#2A7090' },
        gold:    { DEFAULT: '#D4A853', light: '#FDF3DC', dark: '#8A6010' },
        ink:     { DEFAULT: '#1C2B2B', md: '#3D4F4F', lt: '#6B7E7E' },
        paper:   '#FDFAF6',
        cream:   '#FFF5EE',
      },
      borderColor: {
        DEFAULT: 'rgba(28,43,43,0.10)',
        md: 'rgba(28,43,43,0.18)',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(28,43,43,0.06), 0 2px 12px rgba(28,43,43,0.05)',
        md: '0 4px 16px rgba(28,43,43,0.08), 0 8px 40px rgba(28,43,43,0.06)',
        lg: '0 12px 48px rgba(28,43,43,0.12), 0 4px 16px rgba(28,43,43,0.06)',
      },
      typography: ({ theme }) => ({
        jurnal: {
          css: {
            '--tw-prose-body': theme('colors.ink.md'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-bold': theme('colors.ink.DEFAULT'),
            '--tw-prose-links': theme('colors.coral.DEFAULT'),
            '--tw-prose-quotes': theme('colors.ink.md'),
            '--tw-prose-quote-borders': theme('colors.coral.DEFAULT'),
            fontFamily: theme('fontFamily.body').join(', '),
            fontSize: '15px',
            lineHeight: '1.8',
            h2: { fontFamily: theme('fontFamily.display').join(', '), fontWeight: '700', letterSpacing: '-0.3px' },
            h3: { fontFamily: theme('fontFamily.display').join(', '), fontWeight: '600' },
            blockquote: { background: theme('colors.cream'), borderRadius: '0 8px 8px 0', padding: '12px 20px' },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
