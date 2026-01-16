# ⚡ Configuração Rápida - Passo a Passo

## 📍 PARTE 1: Netlify - Variáveis de Ambiente

### 1. Acesse o Netlify
- URL: https://app.netlify.com
- Faça login
- Selecione seu site

### 2. Vá em Configurações
- Menu lateral → **"Site settings"**
- Menu superior → **"Environment variables"**

### 3. Adicione estas 7 variáveis (uma por uma):

#### Variável 1:
```
Key: PAGBANK_TOKEN
Value: [COLE SEU TOKEN DO PAGBANK AQUI]
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 2:
```
Key: REACT_APP_FIREBASE_API_KEY
Value: AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 3:
```
Key: REACT_APP_FIREBASE_AUTH_DOMAIN
Value: posturoscience-60062.firebaseapp.com
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 4:
```
Key: REACT_APP_FIREBASE_PROJECT_ID
Value: posturoscience-60062
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 5:
```
Key: REACT_APP_FIREBASE_STORAGE_BUCKET
Value: posturoscience-60062.firebasestorage.app
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 6:
```
Key: REACT_APP_FIREBASE_MESSAGING_SENDER_ID
Value: 724542300299
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

#### Variável 7:
```
Key: REACT_APP_FIREBASE_APP_ID
Value: 1:724542300299:web:1b0483fbb5578d4d27748e
Scopes: ✅ All scopes, ✅ Build, ✅ Functions
```

### 4. Como obter o PAGBANK_TOKEN:
1. Acesse: https://pagseguro.uol.com.br
2. Faça login
3. Vá em **"Integrações"** → **"API"** → **"Tokens"**
4. Copie o token de **produção** ou **sandbox**
5. Cole no campo `Value` da variável `PAGBANK_TOKEN`

---

## 📍 PARTE 2: PagBank - Configurar Webhook

### 1. Descubra seu domínio do Netlify
- No Netlify, vá em **"Domain settings"**
- Anote seu domínio (exemplo: `podostore.netlify.app`)

### 2. Acesse o PagBank
- URL: https://pagseguro.uol.com.br
- Faça login
- Vá em **"Integrações"** ou **"Desenvolvedor"**

### 3. Configure o Webhook
- Procure por **"Webhooks"** ou **"Notificações"**
- Clique em **"Adicionar webhook"**

**Preencha:**
```
URL: https://SEU-DOMINIO.netlify.app/.netlify/functions/payment-webhook
```
(Substitua `SEU-DOMINIO` pelo domínio real do seu site)

**Eventos:**
- ✅ Todos os eventos de pagamento
- Ou selecione: `PAYMENT.*`

**Salve!**

---

## ✅ VERIFICAÇÃO

### Teste 1: Verificar variáveis
- Netlify → Site settings → Environment variables
- Deve ter 7 variáveis listadas

### Teste 2: Verificar webhook
- PagBank → Webhooks
- Deve estar **Ativo**

### Teste 3: Testar checkout
1. Acesse: `https://SEU-DOMINIO.netlify.app/checkout`
2. Preencha o formulário
3. Crie um checkout
4. Verifique se funciona

---

## 🆘 PROBLEMAS?

### Erro: "Token não configurado"
→ Verifique se `PAGBANK_TOKEN` está no Netlify com escopo **Functions**

### Erro: "Firebase não configurado"
→ Verifique se todas as 6 variáveis do Firebase estão configuradas

### Webhook não funciona
→ Verifique se a URL está correta (deve ser HTTPS)
→ Verifique os logs em: Netlify → Functions → payment-webhook → Logs

---

**Pronto!** 🎉
