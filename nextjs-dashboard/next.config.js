/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["orange-space-broccoli-wrrrr7v644qxh97x5-3000.app.github.dev", "localhost", "localhost:3000"]
        }
    }
};

module.exports = nextConfig;
