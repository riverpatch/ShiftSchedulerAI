/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f2fdff',
        'dark-background': '#001140',
        foreground: '#001140',
        'dark-foreground': '#f2fdff',
        primary: '#261e67',
        secondary: '#f1f5f9',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        muted: '#f8fafc',
        accent: '#ef476f',
        popover: '#f8fafc',
        card: '#ffffff',
        'sidebar-background': '#f1f5f9',
        'sidebar-primary': '#261e67',
        'sidebar-accent': '#e6f2f9',
        'scheduler-primary': '#001140',
        'scheduler-secondary': '#6f7d7f',
        'scheduler-tertiary': '#261e67',
        'scheduler-dark': '#0a0a23',
        'scheduler-light': '#e6f2f9',
        'scheduler-success': '#22c55e',
        'scheduler-warning': '#f97316',
        'scheduler-danger': '#ef4444',
        'scheduler-info': '#0ea5e9',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        display: ['Rubik', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-light': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-light': 'pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}; 