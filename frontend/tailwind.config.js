/** @type {import('tailwind.config').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'legal-base': '#080A0C', 
        'legal-surface': '#111418', 
        'legal-muted': '#1F242A', 
        
        'authority-gold': '#C5A065', 
        'trust-teal': '#00A896', 
        'blockchain-blue': '#10A1F0', 
        
        'dark-success': '#2EA043',
        'dark-warning': '#DAA520',
        'dark-error': '#FF453A',
        
        'text-dark-primary': '#E6EDF3', 
        'text-dark-secondary': '#8B949E', 
        'text-dark-headers': '#F0F6FC', 
      },
      fontFamily: {
        header: ['Lora', 'serif'], 
        sans: ['Inter', 'sans-serif'], 
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}