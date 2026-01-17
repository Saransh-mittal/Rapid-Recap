/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    // Add more specific paths based on your project structure
    './src/components/**/*.{js,jsx}',
    './src/screens/**/*.{js,jsx}',
    './src/routes/**/*.{js,jsx}',
    './src/contextAPI/**/*.{js,jsx}',
    './src/redux/**/*.{js,jsx}',
    './src/utils/**/*.{js,jsx}',
    './src/services/**/*.{js,jsx}',
    './src/customHooks/**/*.{js,jsx}',
    // Make sure it includes ALL your files
    './src/**/*',
  ],
  theme: {
    screens: {
      'xs': '340px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Custom colors for your AI theme
      colors: {
        'ai-cyan': '#22d3ee',
        'ai-blue': '#3b82f6',
        'ai-dark-blue': '#1e40af',
        'ai-slate': '#0f172a',
        'ai-gray': '#1e293b',
      },
      // Custom animations for premium effects
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)' },
          '100%': {
            boxShadow:
              '0 0 40px rgba(34, 211, 238, 0.8), 0 0 60px rgba(59, 130, 246, 0.3)',
          },
        },
      },
      // Custom backdrop blur values
      backdropBlur: {
        xs: '2px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ai-gradient': 'linear-gradient(135deg, #22d3ee, #3b82f6, #1e40af)',
      },
    },
  },
  plugins: [
    // Add any plugins you need
  ],
}
