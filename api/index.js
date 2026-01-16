// Vercel Serverless Function - Entry point
// Este arquivo exporta o app Express para o Vercel

// Configurar variável para indicar que está no Vercel
process.env.VERCEL = 'true';

// Importar o servidor Express
const app = require('../backend/server');

// Exportar como handler para Vercel
// O Vercel precisa de um handler explícito
module.exports = (req, res) => {
  return app(req, res);
};
