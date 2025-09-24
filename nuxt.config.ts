// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            meta: [
                { name: 'referrer', content: 'strict-origin-when-cross-origin' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }
            ]
            // link: [
            //     { rel: 'shortcut icon', href: '/static/favicon.ico?v=74c785bd6cf5' },
            //     { rel: 'apple-touch-icon', sizes: '180x180', href: '/static/apple-touch-icon.png?v=74c785bd6cf5' },
            //     { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/static/favicon-32x32.png?v=74c785bd6cf5' },
            //     { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/static/favicon-16x16.png?v=74c785bd6cf5' },
            //     { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/static/favicon-96x96.png?v=74c785bd6cf5' }
            // ]
        }
    },
    css: ['~/assets/css/tailwind.css'],
    eslint: {
        config: {
            standalone: true
        }
    },
    fonts: {
        // Custom fonts
        // families: [
        //     {
        //         name: 'Epilepsy Sans',
        //         display: 'swap',
        //         preload: true,
        //         provider: 'local',
        //         fallbacks: ['sans-serif']
        //     }
        // ]
    },
    modules: [
        // prettier-ignore
        '@nuxt/fonts',
        '@pinia/nuxt',
        '@nuxt/eslint',
        '@nuxtjs/i18n',
        '@nuxtjs/device',
        '@nuxtjs/tailwindcss'
    ],
    devtools: { enabled: true },
    typescript: {
        shim: false,
        strict: true
    },
    i18n: {
        locales: [
            { code: 'ru', isoCode: 'ru-RU', name: 'Русский', file: 'ru.json' },
            { code: 'en', isoCode: 'en-US', name: 'English', file: 'en.json' }
        ],
        strategy: 'no_prefix',
        defaultLocale: 'en',
        detectBrowserLanguage: false
    },
    tailwindcss: {
        viewer: false,
        cssPath: '~/assets/css/tailwind.css',
        configPath: 'tailwind.config',
        exposeConfig: true
    },
    compatibilityDate: '2025-07-15'
})
