const env = require(`./env.js`)

export default {
    server: {
        port: 8000,
        host: '0.0.0.0',
    },
    plugins: [
        { src: '~/plugins/firebase-client.js', ssr: false },
    ],
    env,
}