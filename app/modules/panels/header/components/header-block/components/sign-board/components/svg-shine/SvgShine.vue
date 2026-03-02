<template>
    <svg viewBox="0 0 466 308" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="shine-layer-1" style="mix-blend-mode: plus-lighter">
            <path
                d="M121 88.8773L201.537 214.377H213.314L258 88.8773L320.5 94.3773L229.666 216.114L403 124.377L399.5 241.877L235.961 232.664L343 291.377H228.5L211.516 237.513C210.321 237.45 208.92 237.377 207 237.377C205.098 237.377 203.418 237.449 201.957 237.429L182.5 291.377L97.5 295.377C99.744 292.385 157.383 250.113 183.531 230.189C153.405 231.228 40.1803 228.384 -7 227.377L-2 182.877L182.099 212.924L64.5 94.3773L121 88.8773Z"
                fill="url(#paint0_radial_640_17735)"
                fill-opacity="0.26"
            />
        </g>
        <g class="shine-layer-2" style="mix-blend-mode: plus-lighter">
            <path
                d="M315.767 94.3773L215.127 215.54L208.547 212.308L213.949 50.8773L148.06 60.9296L195.897 210.728L192.903 210.376C192.469 210.37 191.889 210.398 191.276 210.481L60.2973 58.9592L20.9356 169.725L180.675 221.766L1.26678 281.877L77.7668 332.877L197.314 233.722C198.534 234.127 199.961 234.585 201.956 235.362C202.081 235.41 202.204 235.459 202.327 235.507L212.285 336.877L274.267 341.877C273.245 338.217 246.087 279.243 225.899 236.945C252.73 248.568 360.384 287.389 405.007 303.672L416.49 260.389L233.353 221.463L382.767 141.877L315.767 94.3773Z"
                fill="url(#paint1_radial_640_17735)"
                fill-opacity="0.26"
            />
        </g>
        <defs>
            <radialGradient
                id="paint0_radial_640_17735"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(198 203.877) rotate(90) scale(91.5 181.671)"
            >
                <stop offset="0.442308" stop-color="#FFE941" />
                <stop offset="1" stop-color="#FFE941" stop-opacity="0" />
            </radialGradient>
            <radialGradient
                id="paint1_radial_640_17735"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(222.495 207.408) rotate(111.269) scale(91.5 181.671)"
            >
                <stop offset="0.442308" stop-color="#FFE941" />
                <stop offset="1" stop-color="#FFE941" stop-opacity="0" />
            </radialGradient>
        </defs>
    </svg>
</template>

<style scoped>
    .shine-layer-1 {
        opacity: 0.52;
        animation: shine-pulse 2s ease-in-out infinite;
    }

    .shine-layer-2 {
        opacity: 0.52;
        animation: shine-pulse 2s ease-in-out infinite;
        animation-delay: 0.5s;
    }

    @keyframes shine-pulse {
        0%,
        100% {
            opacity: 0.52;
        }
        50% {
            opacity: 0.85;
        }
    }
</style>
