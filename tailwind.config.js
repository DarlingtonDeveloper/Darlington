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
                'marquee-reverse': 'marquee-reverse var(--duration, 30s) linear infinite',
                rainbow: "rainbow var(--speed, 4s) linear infinite",
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
                'marquee-reverse': {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0%)' }
                },
                rainbow: {
                    "0%": { backgroundPosition: "0% center" },
                    "100%": { backgroundPosition: "200% center" },
                },
            },
            colors: {
                'sky': {
                    400: '#38bdf8',
                    500: '#0ea5e9'
                },
                "color-1": "hsl(var(--color-1))",
                "color-2": "hsl(var(--color-2))",
                "color-3": "hsl(var(--color-3))",
                "color-4": "hsl(var(--color-4))",
                "color-5": "hsl(var(--color-5))",
            }
        },
    },
    plugins: [],
}