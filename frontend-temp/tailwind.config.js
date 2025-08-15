
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			boxShadow: {
				soft: '0 2px 30px rgba(0,0,0,0.06)'
			},
			colors: {
				brand: {
					50: '#eef7ff',
					100: '#d9ebff',
					200: '#b8d9ff',
					300: '#8fc0ff',
					400: '#5ea0ff',
					500: '#347eff',
					600: '#1d5ffa',
					700: '#174ad6',
					800: '#153eaa',
					900: '#163a85'
				}
			}
		}
	},
	plugins: []
};