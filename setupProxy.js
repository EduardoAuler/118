const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Configuração de proxy para checkouts
  app.use(
    '/checkouts',
    createProxyMiddleware({
      target: 'https://sandbox.api.pagseguro.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/checkouts': '/checkouts'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('📤 Proxying checkout request to:', proxyReq.path);
        console.log('📤 Headers:', JSON.stringify(proxyReq.getHeaders(), null, 2));
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('📥 Checkout response status:', proxyRes.statusCode);
        // Adicionar CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: (err, req, res) => {
        console.error('❌ Checkout proxy error:', err);
      }
    })
  );

  // Configuração de proxy para orders
  app.use(
    '/orders',
    createProxyMiddleware({
      target: 'https://sandbox.api.pagseguro.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/orders': '/orders'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('📤 Proxying order request to:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('📥 Order response status:', proxyRes.statusCode);
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: (err, req, res) => {
        console.error('❌ Order proxy error:', err);
      }
    })
  );
};
