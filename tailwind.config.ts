import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    content: ['./app/**/*.{vue,js,ts}'],
    theme: {
        container: {
            center: true,
            padding: '1rem'
        },
        extend: {
            colors: {
                // Custom colors
                // screen: { dark: '#000', light: '#BBC8B5' },
                // scrollbar: { track: '#585858', thumb: '#BBC8B5' }
            },
            fontFamily: {
                // Custom font families
                // sans: ['Inter', 'system-ui', 'sans-serif'],
                // pixels: ['Epilepsy Sans', 'sans-serif']
            }
            // Custom border colors and other options
            //borderColor: { button: '#BBC8B5' },
            //borderRadius: { xl: '1rem' },

            // Custom background colors
            // backgroundColor: {
            //     button: { active: '#BBC8B5', inactive: '#000' }
            // }
        }
    }
}
