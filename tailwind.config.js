/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens:{
      md: {max: '767px'},
      lg: {max: '1439px'},
    },
    extend: {
      colors: {
        customBlue: "#2196F3",
        customWarning: "#ffc107",
        customGreen: "#4CAF50",
        customRed: "#DA1E28",
        customGrey: "#9E9E9E",
      },
      borderRadius: {
        10: "40px",
      },
      opacity: {
        3: "0.03",
      },
      width: {
        6.5: "26px",
      },
      height: {
        6.5: "26px",
      },
      boxShadow: {
        'cards': '0px 0px 30px 0px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        arrival:{
          '0%, 100%': {
            transform: 'translateX(200px)'
          },
          '20%, 80%': {
            transform: 'translateX(-256px)'
          }
        },
        fadeIn: {
          '0%': {
            transform: 'scale(0.8)',
            opacity: 0,
          },
          '40%': {
            transform: 'scale(1.05)',
            opacity: 0.75,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          }
        },
        slowAppearance: {
          '0%': {
            transform: 'scale(0.75)',
            opacity: 0,
          },
          '40%': {
            transform: 'scale(1)',
            opacity: 0.4,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          }
        }
      },
      animation: {
        messageArrival: 'arrival 5s ease-in-out',
        fadeIn: 'fadeIn 1s',
        slowAppearance: 'slowAppearance 1s'
      }
    },
  },
  plugins: [],
};
