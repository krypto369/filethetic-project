/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle WalletConnect worker files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
      };
    }

    // Modify the module rules to handle worker files
    config.module.rules.push({
      test: /\.worker\.js$|\.worker\.[0-9a-f]{8}\.js$|HeartbeatWorker.*\.js$/,
      loader: 'ignore-loader',
    });

    return config;
  },
  // Disable minification for troubleshooting
  swcMinify: false,
};

module.exports = nextConfig;
