import {defineConfig} from 'unocss'
import {presetWind3, presetIcons, transformerVariantGroup, transformerDirectives} from 'unocss'

export default defineConfig({
    presets: [
        presetWind3(),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
                // cdn: 'https://esm.sh/',
            }
        }),
    ],
    transformers: [transformerVariantGroup(), transformerDirectives()],
    shortcuts: {
        'flex-center': 'flex items-center justify-center',
        'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'card': 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg',
        'btn': 'px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow',
        'btn-secondary': 'px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
    },
    theme: {
        colors: {
            primary: '#3b82f6',
        },
        animation: {
            keyframes: {
                'fade-in': '{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}',
                'fade-out': '{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(10px)}}',
            },
            durations: {
                'fade-in': '0.3s',
                'fade-out': '0.3s',
            }
        }
    },
})