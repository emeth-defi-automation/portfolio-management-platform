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
        customGradient: 'linear-gradient(241deg, #309A6D 22.4%, #7DC767 69.51%, #F9F952 95.88%)'
      },
      borderRadius: {
        10: "40px",
      },
      keyframes: {
        arrival:{
          '0%, 100%': {
            transform: 'translateX(200px)'
          },
          '20%, 80%': {
            transform: 'translateX(-256px)'
          }
        }
      }, 
      animation: {
        messageArrival: 'arrival 5s',
      }
    },
  },
  plugins: [],
};
