/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            animation: {
                marquee: 'marquee var(--duration, 30s) linear infinite',
                'marquee-reverse': 'marquee-reverse var(--duration, 30s) linear infinite'
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
                'marquee-reverse': {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0%)' }
                }
            },
            colors: {
                'sky': {
                    400: '#38bdf8',
                    500: '#0ea5e9'
                }
            }
        },
    },
    plugins: [],
}