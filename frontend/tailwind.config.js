/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090b',
                panel: '#18181b',
                highlight: '#27272a',
                accent: '#3f3f46',
                textMain: '#f8fafc',
                textMuted: '#a1a1aa',
            }
        },
    },
    plugins: [],
}
