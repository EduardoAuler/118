# 🚀 Deploy Vercel - Guia Rápido

## ⚡ Passo a Passo Simplificado

### 1️⃣ Criar conta
- Acesse: https://vercel.com
- Faça login com GitHub

### 2️⃣ Importar projeto
1. Clique em **"Add New..."** → **"Project"**
2. Selecione seu repositório
3. Clique em **"Import"**

### 3️⃣ Configurar
**Build Settings:**
- Framework: `Other`
- Build Command: (deixe vazio)
- Output Directory: (deixe vazio)

**Environment Variables:**
Adicione estas variáveis (marque todas para Production, Preview e Development):

```
PAGBANK_TOKEN=6c8ba9fc-80f9-4b20-9528-16c442fc795d697398ef46a68ecc787f11af88df421bc63d-55de-42d0-9653-8e61a4cdfb3a
REACT_APP_FIREBASE_API_KEY=AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U
REACT_APP_FIREBASE_AUTH_DOMAIN=posturoscience-60062.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=posturoscience-60062
REACT_APP_FIREBASE_STORAGE_BUCKET=posturoscience-60062.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=724542300299
REACT_APP_FIREBASE_APP_ID=1:724542300299:web:1b0483fbb5578d4d27748e
```

### 4️⃣ Deploy
1. Clique em **"Deploy"**
2. Aguarde 1-3 minutos
3. Anote a URL: `https://seu-projeto.vercel.app`

### 5️⃣ Testar
Acesse: `https://seu-projeto.vercel.app/api/health`

Deve retornar: `{"status":"ok","service":"pagbank-backend"}`

### 6️⃣ Configurar Webhook
No PagBank → "Configurações" → "Notificação de transação":
- URL: `https://seu-projeto.vercel.app/api/payment-webhook`
- Salvar

### 7️⃣ Atualizar Frontend
No `.env` do frontend:
```
REACT_APP_BACKEND_URL=https://seu-projeto.vercel.app
```

---

## ✅ Pronto!

Seu backend está no ar! 🎉

**URL do backend:** `https://seu-projeto.vercel.app`
