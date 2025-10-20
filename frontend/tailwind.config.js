/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideIn': 'slideIn 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      colors: {
        cyber: {
          bg: '#0a0f1f',
          panel: '#121a2b',
          accent: '#00b4d8'
        }
      },
      boxShadow: {
        neon: '0 0 5px #00b4d8, 0 0 10px #00b4d8'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            p: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            h1: {
              marginTop: '1rem',
              marginBottom: '0.75rem',
            },
            h2: {
              marginTop: '1rem',
              marginBottom: '0.5rem',
            },
            h3: {
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
            },
            ul: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            ol: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            li: {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            strong: {
              fontWeight: '600',
            },
            code: {
              backgroundColor: 'rgb(243 244 246)',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            },
            pre: {
              backgroundColor: 'rgb(243 244 246)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
            },
          },
        },
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
