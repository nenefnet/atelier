import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

// Neutral palette: black/white/grays. No saturated brand color.
// "brand" tokens stay so existing components don't need to change — they
// just resolve to dark slate now instead of indigo.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface
        bg: '#ffffff',
        surface: colors.slate[50],
        card: '#ffffff',
        // Borders
        border: colors.slate[200],
        'border-strong': colors.slate[300],
        // Text
        ink: colors.slate[900],
        'ink-muted': colors.slate[600],
        'ink-faint': colors.slate[400],
        // Brand → dark slate (charcoal). Renders as the primary action color.
        brand: {
          DEFAULT: colors.slate[900],
          hover: colors.slate[800],
          soft: colors.slate[100],
          ring: colors.slate[400],
        },
        // Status — kept semantic but desaturated
        success: colors.slate[700],
        'success-soft': colors.slate[100],
        warn: colors.amber[700],
        'warn-soft': colors.amber[50],
        danger: colors.slate[800],
        'danger-soft': colors.slate[100],
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      maxWidth: {
        page: '1200px',
        prose: '70ch',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        pop: '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 200ms ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
