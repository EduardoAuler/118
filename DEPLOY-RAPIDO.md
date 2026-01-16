# 🚀 Deploy Rápido - Backend PagBank

## Opção Mais Fácil: Render (Grátis)

### 1️⃣ Criar conta no Render
- Acesse: https://render.com
- Faça login com GitHub

### 2️⃣ Criar Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `podostore-backend`
   - **Root Directory**: `backend` (IMPORTANTE!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

### 3️⃣ Adicionar Variáveis de Ambiente
Na seção **"Environment"**, adicione estas variáveis:

```
PAGBANK_TOKEN=6c8ba9fc-80f9-4b20-9528-16c442fc795d697398ef46a68ecc787f11af88df421bc63d-55de-42d0-9653-8e61a4cdfb3a
REACT_APP_FIREBASE_API_KEY=AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U
REACT_APP_FIREBASE_AUTH_DOMAIN=posturoscience-60062.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=posturoscience-60062
REACT_APP_FIREBASE_STORAGE_BUCKET=posturoscience-60062.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=724542300299
REACT_APP_FIREBASE_APP_ID=1:724542300299:web:1b0483fbb5578d4d27748e
PORT=4000
```

### 4️⃣ Fazer Deploy
1. Clique em **"Create Web Service"**
2. Aguarde 2-5 minutos
3. Anote a URL: `https://podostore-backend.onrender.com` (ou similar)

### 5️⃣ Atualizar Frontend
No arquivo `.env` do frontend, adicione:
```
REACT_APP_BACKEND_URL=https://podostore-backend.onrender.com
```

### 6️⃣ Configurar Webhook no PagBank
1. Acesse PagBank → "Configurações" → "Notificação de transação"
2. Cole a URL: `https://podostore-backend.onrender.com/api/payment-webhook`
3. Clique em "Salvar configurações"

### ✅ Pronto!
Teste acessando: `https://podostore-backend.onrender.com/api/health`

---

## 🐛 Problemas Comuns

**Erro: "Cannot find module"**
- Certifique-se de que o **Root Directory** está como `backend`

**Backend não inicia**
- Verifique se todas as variáveis de ambiente foram adicionadas
- Veja os logs em "Logs" no painel do Render

**Webhook não funciona**
- Verifique se a URL está correta
- Teste acessando a URL do webhook no navegador (deve retornar erro 400, não 404)
