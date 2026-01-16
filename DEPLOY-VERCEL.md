# 🚀 Deploy no Vercel - Passo a Passo

## 📋 Pré-requisitos

1. Conta no Vercel (grátis): https://vercel.com
2. Repositório no GitHub/GitLab/Bitbucket
3. Vercel CLI instalado (opcional, mas recomendado)

---

## 🎯 Método 1: Via Dashboard Web (Mais Fácil)

### Passo 1: Criar conta no Vercel
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com GitHub/GitLab/Bitbucket

### Passo 2: Importar projeto
1. No dashboard, clique em **"Add New..."** → **"Project"**
2. Selecione seu repositório
3. Clique em **"Import"**

### Passo 3: Configurar projeto
Na tela de configuração:

**Build Settings:**
- **Framework Preset**: `Other`
- **Root Directory**: Deixe vazio (raiz do projeto)
- **Build Command**: Deixe vazio
- **Output Directory**: Deixe vazio
- **Install Command**: `npm install`

**Environment Variables:**
Clique em **"Environment Variables"** e adicione:

```
PAGBANK_TOKEN=6c8ba9fc-80f9-4b20-9528-16c442fc795d697398ef46a68ecc787f11af88df421bc63d-55de-42d0-9653-8e61a4cdfb3a
REACT_APP_FIREBASE_API_KEY=AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U
REACT_APP_FIREBASE_AUTH_DOMAIN=posturoscience-60062.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=posturoscience-60062
REACT_APP_FIREBASE_STORAGE_BUCKET=posturoscience-60062.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=724542300299
REACT_APP_FIREBASE_APP_ID=1:724542300299:web:1b0483fbb5578d4d27748e
```

**⚠️ IMPORTANTE:** Marque todas as variáveis para **Production**, **Preview** e **Development**

### Passo 4: Deploy
1. Clique em **"Deploy"**
2. Aguarde 1-3 minutos
3. Anote a URL gerada: `https://seu-projeto.vercel.app`

### Passo 5: Verificar
Acesse: `https://seu-projeto.vercel.app/api/health`

Deve retornar:
```json
{"status":"ok","service":"pagbank-backend"}
```

---

## 🎯 Método 2: Via CLI (Mais Rápido)

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Login
```bash
vercel login
```

### Passo 3: Configurar variáveis de ambiente
```bash
vercel env add PAGBANK_TOKEN
# Cole o token quando solicitado
# Escolha: Production, Preview, Development

vercel env add REACT_APP_FIREBASE_API_KEY
# Cole a chave quando solicitado
# Escolha: Production, Preview, Development

# Repita para todas as outras variáveis:
# REACT_APP_FIREBASE_AUTH_DOMAIN
# REACT_APP_FIREBASE_PROJECT_ID
# REACT_APP_FIREBASE_STORAGE_BUCKET
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID
# REACT_APP_FIREBASE_APP_ID
```

### Passo 4: Deploy
```bash
vercel
```

Siga as instruções:
- **Set up and deploy?** → `Y`
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → `N` (primeira vez)
- **Project name?** → `podostore-backend` (ou o nome que preferir)
- **Directory?** → `.` (ponto, raiz do projeto)

### Passo 5: Deploy de produção
```bash
vercel --prod
```

---

## 🔧 Configurar Webhook no PagBank

Após o deploy, configure o webhook:

1. Acesse o painel do PagBank
2. Vá em **"Configurações"** → **"Notificação de transação"**
3. Cole a URL: `https://seu-projeto.vercel.app/api/payment-webhook`
4. Clique em **"Salvar configurações"**

---

## 🔄 Atualizar Frontend

No arquivo `.env` do frontend, adicione:
```env
REACT_APP_BACKEND_URL=https://seu-projeto.vercel.app
```

---

## ✅ Verificar se está funcionando

### Teste 1: Health Check
```bash
curl https://seu-projeto.vercel.app/api/health
```

### Teste 2: Criar Checkout (via frontend)
1. Acesse o frontend
2. Tente criar um checkout
3. Verifique os logs no Vercel Dashboard → "Functions" → "Logs"

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Verifique se o `vercel.json` está na raiz do projeto
- Certifique-se de que todas as dependências estão no `package.json`

### Erro: "Function timeout"
- Vercel tem limite de 10s no plano gratuito
- Para funções mais longas, considere upgrade ou use outra plataforma

### Variáveis de ambiente não funcionam
- Verifique se adicionou para **Production**, **Preview** e **Development**
- Reinicie o deploy após adicionar variáveis

### Rota não encontrada (404)
- Verifique se o `vercel.json` está configurado corretamente
- As rotas devem começar com `/api/`

---

## 📝 Checklist Final

- [ ] Projeto deployado no Vercel
- [ ] Health check retorna OK
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Webhook configurado no PagBank
- [ ] Frontend atualizado com `REACT_APP_BACKEND_URL`
- [ ] Teste de checkout funcionando

---

## 🎉 Pronto!

Seu backend está no ar! A URL será algo como:
`https://seu-projeto.vercel.app`

**Dica:** O Vercel gera URLs automáticas, mas você pode adicionar um domínio customizado depois nas configurações do projeto.
