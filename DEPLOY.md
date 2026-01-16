# 🚀 Guia de Deploy do Backend

Este guia mostra como fazer deploy do backend Node.js em diferentes plataformas.

## 📋 Pré-requisitos

1. Conta na plataforma escolhida (Render, Railway, Vercel, etc.)
2. Repositório Git (GitHub, GitLab, etc.)
3. Variáveis de ambiente configuradas

---

## 🎯 Opção 1: Render (Recomendado - Grátis)

### Passo 1: Criar conta
1. Acesse: https://render.com
2. Faça login com GitHub/GitLab

### Passo 2: Criar novo Web Service
1. Clique em "New +" → "Web Service"
2. Conecte seu repositório
3. Configure:
   - **Name**: `podostore-backend` (ou o nome que preferir)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Instance Type**: `Free` (ou pago se preferir)

### Passo 3: Configurar variáveis de ambiente
Na seção "Environment Variables", adicione:

```
PAGBANK_TOKEN=seu-token-aqui
REACT_APP_FIREBASE_API_KEY=sua-chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-dominio
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
REACT_APP_FIREBASE_APP_ID=seu-app-id
PORT=4000
```

### Passo 4: Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (pode levar alguns minutos)
3. Anote a URL gerada: `https://seu-backend.onrender.com`

### Passo 5: Atualizar frontend
No arquivo `.env` do frontend, adicione:
```
REACT_APP_BACKEND_URL=https://seu-backend.onrender.com
```

---

## 🎯 Opção 2: Railway

### Passo 1: Criar conta
1. Acesse: https://railway.app
2. Faça login com GitHub

### Passo 2: Criar novo projeto
1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório

### Passo 3: Configurar
1. Railway detecta automaticamente Node.js
2. Configure o **Root Directory**: `backend`
3. Configure o **Start Command**: `node server.js`

### Passo 4: Variáveis de ambiente
1. Vá em "Variables"
2. Adicione todas as variáveis (mesmas do Render)

### Passo 5: Deploy
1. Railway faz deploy automaticamente
2. Anote a URL: `https://seu-backend.up.railway.app`

---

## 🎯 Opção 3: Vercel (Serverless)

### Passo 1: Criar `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

### Passo 2: Deploy
1. Instale Vercel CLI: `npm i -g vercel`
2. Execute: `vercel`
3. Configure variáveis de ambiente no painel

---

## 🎯 Opção 4: Heroku

### Passo 1: Instalar Heroku CLI
```bash
npm install -g heroku
```

### Passo 2: Login
```bash
heroku login
```

### Passo 3: Criar app
```bash
heroku create seu-backend-nome
```

### Passo 4: Configurar variáveis
```bash
heroku config:set PAGBANK_TOKEN=seu-token
heroku config:set REACT_APP_FIREBASE_API_KEY=sua-chave
# ... adicione todas as outras
```

### Passo 5: Deploy
```bash
git push heroku main
```

---

## 🔧 Configurar Webhook no PagBank

Após o deploy, configure o webhook:

1. Acesse o painel do PagBank
2. Vá em "Configurações" → "Notificação de transação"
3. Cole a URL: `https://SEU-BACKEND.com/api/payment-webhook`
4. Clique em "Salvar configurações"

---

## ✅ Verificar se está funcionando

Teste o health check:
```bash
curl https://SEU-BACKEND.com/api/health
```

Deve retornar:
```json
{"status":"ok","service":"pagbank-backend"}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Certifique-se de que o `package.json` do backend está correto
- Verifique se todas as dependências estão listadas

### Erro: "Port already in use"
- A plataforma define a porta automaticamente via `process.env.PORT`
- Não precisa configurar manualmente

### Variáveis de ambiente não funcionam
- Verifique se adicionou todas no painel da plataforma
- Reinicie o serviço após adicionar variáveis

---

## 📝 Checklist Final

- [ ] Backend deployado e acessível
- [ ] Health check retorna OK
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend atualizado com `REACT_APP_BACKEND_URL`
- [ ] Webhook configurado no PagBank
- [ ] Teste de checkout funcionando
