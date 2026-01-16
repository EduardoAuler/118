# 🚀 Deploy no Vercel - Guia Final

## ✅ Configuração Atual

A configuração está pronta para deploy! Os arquivos foram ajustados:

- ✅ `vercel.json` - Configurado corretamente
- ✅ `api/index.js` - Entry point para serverless functions
- ✅ `backend/server.js` - Exporta o app Express corretamente
- ✅ Dependências no `package.json` raiz

## 📋 Passo a Passo no Vercel

### 1. Conectar o Repositório
- Acesse [vercel.com](https://vercel.com)
- Clique em "Add New Project"
- Conecte seu repositório GitHub
- Selecione o repositório `118-podostore`

### 2. Configurar o Projeto
- **Framework Preset**: Deixe em branco ou selecione "Other"
- **Root Directory**: Deixe como `.` (raiz)
- **Build Command**: Deixe vazio (não precisa buildar o React aqui)
- **Output Directory**: Deixe vazio
- **Install Command**: `npm install`

### 3. Variáveis de Ambiente
Adicione TODAS estas variáveis no Vercel:

**Firebase:**
```
REACT_APP_FIREBASE_API_KEY=sua-chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-dominio
REACT_APP_FIREBASE_PROJECT_ID=seu-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
REACT_APP_FIREBASE_APP_ID=seu-app-id
```

**PagBank:**
```
PAGBANK_TOKEN=seu-token-pagbank
```

**OpenAI (opcional):**
```
REACT_APP_OPENAI_API_KEY=sua-chave-openai
```

### 4. Deploy
- Clique em "Deploy"
- Aguarde o build completar

## 🧪 Testar Após Deploy

Após o deploy, teste estas URLs:

1. **Rota raiz:**
   ```
   https://seu-projeto.vercel.app/
   ```
   Deve retornar JSON com informações da API

2. **Health check:**
   ```
   https://seu-projeto.vercel.app/api/health
   ```
   Deve retornar: `{"status":"ok","service":"pagbank-backend"}`

3. **Create checkout (POST):**
   ```
   POST https://seu-projeto.vercel.app/api/create-checkout
   ```

## ⚠️ Se Der Erro 404

1. Verifique os **Logs** no Vercel:
   - Vá em "Deployments" → Clique no último deploy
   - Veja a aba "Functions" → "Logs"

2. Verifique as **Variáveis de Ambiente**:
   - Vá em "Settings" → "Environment Variables"
   - Certifique-se de que TODAS estão configuradas

3. Verifique o **Build**:
   - Veja se o build foi bem-sucedido
   - Procure por erros de instalação de dependências

## 🔧 Atualizar Frontend

Depois que o backend estiver funcionando, atualize o frontend:

1. No arquivo `.env` do frontend, adicione:
   ```
   REACT_APP_BACKEND_URL=https://seu-projeto.vercel.app
   ```

2. Ou configure no serviço onde o frontend está hospedado (Netlify, Vercel, etc.)

## 📝 Notas Importantes

- O Vercel usa Node.js 18.x (configurado no `vercel.json`)
- Todas as rotas são redirecionadas para `/api/index.js`
- O Express detecta automaticamente o ambiente Vercel
- Não precisa fazer build do React no Vercel (só o backend)
