# 🚀 Deploy no Netlify - Guia Completo

## ✅ Configuração Pronta

O projeto está configurado para funcionar no Netlify com:
- ✅ Frontend React (build automático)
- ✅ Netlify Functions para pagamento (PagBank)
- ✅ Redirecionamentos configurados

## 📋 Passo a Passo

### 1. Conectar Repositório no Netlify

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte com GitHub
4. Selecione o repositório: `EduardoAuler/118`

### 2. Configurações de Build

O Netlify deve detectar automaticamente:
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Functions directory**: `netlify/functions`

Se não detectar, configure manualmente:
- Base directory: `.` (raiz)
- Build command: `npm run build`
- Publish directory: `build`
- Functions directory: `netlify/functions`

### 3. Variáveis de Ambiente

Vá em **Site settings** → **Environment variables** e adicione:

#### Firebase (obrigatório):
```
REACT_APP_FIREBASE_API_KEY=sua-chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-dominio
REACT_APP_FIREBASE_PROJECT_ID=seu-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
REACT_APP_FIREBASE_APP_ID=seu-app-id
```

#### PagBank (obrigatório):
```
PAGBANK_TOKEN=seu-token-pagbank
```

#### OpenAI (opcional):
```
REACT_APP_OPENAI_API_KEY=sua-chave-openai
```

**IMPORTANTE**: As variáveis `REACT_APP_*` são expostas no frontend. 
A variável `PAGBANK_TOKEN` é usada apenas nas Netlify Functions (segura).

### 4. Deploy

1. Clique em "Deploy site"
2. Aguarde o build completar
3. Seu site estará em: `https://seu-site.netlify.app`

## 🔧 Como Funciona

### Frontend
- Build do React é gerado em `build/`
- Todas as rotas são redirecionadas para `index.html` (SPA)
- O frontend detecta automaticamente que está no Netlify e usa `/api/*` para as funções

### Backend (Netlify Functions)
- As funções estão em `netlify/functions/`
- `create-checkout.ts` → `POST /api/create-checkout`
- `payment-webhook.ts` → `GET/POST /api/payment-webhook`
- As rotas `/api/*` são automaticamente redirecionadas para `/.netlify/functions/*`

## 🧪 Testar Após Deploy

1. **Frontend**: Acesse `https://seu-site.netlify.app`
2. **Health check**: `https://seu-site.netlify.app/api/payment-webhook?checkoutId=test` (deve retornar erro 400, mas confirma que a função está rodando)
3. **Checkout**: Teste criar um checkout pelo frontend

## 🔗 Configurar Webhook do PagBank

Após o deploy, configure o webhook no PagBank:

1. Acesse o painel do PagBank
2. Vá em "Integrações" → "Notificações de Transação"
3. Adicione a URL: `https://seu-site.netlify.app/api/payment-webhook`
4. Salve

## ⚠️ Troubleshooting

### Build falha
- Verifique os logs no Netlify
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Node.js 18 está configurado

### Functions não funcionam
- Verifique se as variáveis de ambiente estão configuradas
- Verifique os logs em "Functions" → "Logs"
- Certifique-se de que `PAGBANK_TOKEN` está configurado

### Erro 404 nas rotas
- Verifique se o `netlify.toml` está na raiz do projeto
- Verifique se as funções estão em `netlify/functions/`

## 📝 Notas

- O frontend detecta automaticamente o ambiente Netlify
- As Netlify Functions usam Node.js 18
- Todas as variáveis `REACT_APP_*` são expostas no frontend (não coloque secrets nelas)
- O `PAGBANK_TOKEN` é usado apenas nas Functions (seguro)
