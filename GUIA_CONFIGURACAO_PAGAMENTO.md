# Guia Completo de Configuração - Módulo 2 (Pagamento)

Este guia mostra **exatamente** o que você precisa fazer para configurar o sistema de pagamento.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa ter:
1. ✅ Conta no Netlify (onde o site está hospedado)
2. ✅ Conta no PagBank/PagSeguro com acesso à API
3. ✅ Token de autenticação do PagBank
4. ✅ Projeto Firebase configurado

---

## 🔧 PARTE 1: Configurar Variáveis de Ambiente no Netlify

### Passo 1.1: Acessar o Painel do Netlify

1. Acesse: https://app.netlify.com
2. Faça login na sua conta
3. Selecione o site do seu projeto

### Passo 1.2: Acessar Configurações de Variáveis de Ambiente

1. No menu lateral, clique em **"Site settings"** (ou "Configurações do site")
2. No menu superior, clique em **"Environment variables"** (ou "Variáveis de ambiente")
3. Você verá uma lista de variáveis (pode estar vazia)

### Passo 1.3: Adicionar Variável PAGBANK_TOKEN

1. Clique no botão **"Add a variable"** (ou "Adicionar variável")
2. Preencha:
   - **Key (Chave):** `PAGBANK_TOKEN`
   - **Value (Valor):** Cole seu token do PagBank aqui
   - **Scopes (Escopos):** Selecione:
     - ✅ **All scopes** (ou "Todos os escopos")
     - ✅ **Build** (para builds)
     - ✅ **Functions** (para Netlify Functions - **IMPORTANTE**)
3. Clique em **"Save"** (ou "Salvar")

**⚠️ IMPORTANTE:** O token do PagBank você obtém no painel do PagBank:
- Acesse: https://pagseguro.uol.com.br (ou painel do PagBank)
- Vá em **"Integrações"** → **"API"** → **"Tokens"**
- Copie o token de **produção** ou **sandbox** (conforme seu ambiente)

### Passo 1.4: Adicionar Variáveis do Firebase

Você precisa adicionar **6 variáveis** do Firebase. Elas estão no seu arquivo `.env` local ou no console do Firebase.

#### Como encontrar as variáveis do Firebase:

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Clique no ícone de **⚙️ Configurações** (Settings) → **"Configurações do projeto"**
4. Role até a seção **"Seus apps"** → Clique no ícone **`</>`** (Web)
5. Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

#### Adicionar cada variável no Netlify:

**Variável 1: REACT_APP_FIREBASE_API_KEY**
- **Key:** `REACT_APP_FIREBASE_API_KEY`
- **Value:** `AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

**Variável 2: REACT_APP_FIREBASE_AUTH_DOMAIN**
- **Key:** `REACT_APP_FIREBASE_AUTH_DOMAIN`
- **Value:** `posturoscience-60062.firebaseapp.com`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

**Variável 3: REACT_APP_FIREBASE_PROJECT_ID**
- **Key:** `REACT_APP_FIREBASE_PROJECT_ID`
- **Value:** `posturoscience-60062`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

**Variável 4: REACT_APP_FIREBASE_STORAGE_BUCKET**
- **Key:** `REACT_APP_FIREBASE_STORAGE_BUCKET`
- **Value:** `posturoscience-60062.firebasestorage.app`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

**Variável 5: REACT_APP_FIREBASE_MESSAGING_SENDER_ID**
- **Key:** `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `724542300299`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

**Variável 6: REACT_APP_FIREBASE_APP_ID**
- **Key:** `REACT_APP_FIREBASE_APP_ID`
- **Value:** `1:724542300299:web:1b0483fbb5578d4d27748e`
- **Scopes:** ✅ All scopes, ✅ Build, ✅ Functions

### Passo 1.5: Verificar Variáveis Adicionadas

Após adicionar todas, você deve ter **7 variáveis** no total:

1. ✅ `PAGBANK_TOKEN`
2. ✅ `REACT_APP_FIREBASE_API_KEY`
3. ✅ `REACT_APP_FIREBASE_AUTH_DOMAIN`
4. ✅ `REACT_APP_FIREBASE_PROJECT_ID`
5. ✅ `REACT_APP_FIREBASE_STORAGE_BUCKET`
6. ✅ `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
7. ✅ `REACT_APP_FIREBASE_APP_ID`

### Passo 1.6: Fazer Deploy (se necessário)

Se você já fez deploy antes, o Netlify vai usar as novas variáveis no próximo deploy automático.

Se quiser forçar um novo deploy:
1. Vá em **"Deploys"** no menu lateral
2. Clique em **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 🔗 PARTE 2: Configurar Webhook no PagBank

### Passo 2.1: Obter URL do Webhook

Sua URL do webhook será:
```
https://SEU-DOMINIO.netlify.app/.netlify/functions/payment-webhook
```

**Exemplo:**
- Se seu site é: `https://podostore.netlify.app`
- A URL do webhook será: `https://podostore.netlify.app/.netlify/functions/payment-webhook`

**📝 Anote essa URL, você vai precisar dela!**

### Passo 2.2: Acessar Painel do PagBank

1. Acesse: https://pagseguro.uol.com.br (ou painel do PagBank)
2. Faça login na sua conta
3. Vá em **"Integrações"** ou **"Desenvolvedor"**

### Passo 2.3: Configurar Webhook

1. Procure por **"Webhooks"** ou **"Notificações"** no menu
2. Clique em **"Adicionar webhook"** ou **"Configurar webhook"**
3. Preencha os campos:

   **URL do Webhook:**
   ```
   https://SEU-DOMINIO.netlify.app/.netlify/functions/payment-webhook
   ```
   (Substitua `SEU-DOMINIO` pelo domínio real do seu site)

   **Eventos para escutar:**
   - ✅ `PAYMENT.CREATED` (Pagamento criado)
   - ✅ `PAYMENT.UPDATED` (Pagamento atualizado)
   - ✅ `PAYMENT.APPROVED` (Pagamento aprovado)
   - ✅ `PAYMENT.CANCELLED` (Pagamento cancelado)
   - ✅ `PAYMENT.FAILED` (Pagamento falhou)
   
   Ou selecione: **"Todos os eventos de pagamento"** / **"PAYMENT.*"**

4. Clique em **"Salvar"** ou **"Criar webhook"**

### Passo 2.4: Verificar Webhook Configurado

1. Você deve ver o webhook na lista
2. Status deve estar como **"Ativo"** ou **"Enabled"**
3. Anote o **ID do webhook** (pode ser útil depois)

### Passo 2.5: Testar Webhook (Opcional)

O PagBank geralmente permite testar o webhook:
1. Clique no webhook criado
2. Procure por **"Testar"** ou **"Send test notification"**
3. Isso enviará uma notificação de teste para sua URL
4. Verifique os logs do Netlify para ver se recebeu

---

## ✅ PARTE 3: Verificar se Está Funcionando

### Passo 3.1: Verificar Logs do Netlify

1. No Netlify, vá em **"Functions"** no menu lateral
2. Clique em **"payment-webhook"**
3. Você verá os logs de execução
4. Se aparecerem erros, verifique:
   - ✅ Variáveis de ambiente estão configuradas?
   - ✅ Token do PagBank está correto?
   - ✅ URLs do Firebase estão corretas?

### Passo 3.2: Testar Checkout

1. Acesse seu site: `https://SEU-DOMINIO.netlify.app/checkout`
2. Preencha o formulário de checkout
3. Crie um checkout de teste
4. Verifique se:
   - ✅ Checkout é criado com sucesso
   - ✅ Redirecionamento para PagBank funciona
   - ✅ Após pagamento, redireciona para `/checkout/success`
   - ✅ Status é verificado automaticamente

### Passo 3.3: Verificar Firestore

1. Acesse: https://console.firebase.google.com
2. Vá em **Firestore Database**
3. Verifique se existe a coleção **`payments`**
4. Após um pagamento, deve aparecer um documento com o `checkoutId`

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Problema: Webhook não recebe notificações

**Soluções:**
1. Verifique se a URL está correta (deve ser HTTPS)
2. Verifique se o webhook está ativo no PagBank
3. Verifique os logs do Netlify Functions
4. Teste manualmente acessando: `https://SEU-DOMINIO.netlify.app/.netlify/functions/payment-webhook?checkoutId=TESTE`

### Problema: Erro "Token não configurado"

**Solução:**
1. Verifique se `PAGBANK_TOKEN` está configurado no Netlify
2. Verifique se o escopo inclui **Functions**
3. Faça um novo deploy após adicionar a variável

### Problema: Erro "Firebase não configurado"

**Solução:**
1. Verifique se todas as 6 variáveis do Firebase estão configuradas
2. Verifique se os valores estão corretos (copie exatamente do console do Firebase)
3. Verifique se o escopo inclui **Functions**

### Problema: Status não atualiza

**Soluções:**
1. Verifique se o webhook está configurado corretamente
2. Verifique os logs do Netlify Functions
3. Verifique se o `checkoutId` está sendo passado na URL
4. Tente atualizar manualmente a página de sucesso

---

## 📝 CHECKLIST FINAL

Antes de considerar tudo configurado, verifique:

- [ ] ✅ `PAGBANK_TOKEN` configurado no Netlify
- [ ] ✅ 6 variáveis do Firebase configuradas no Netlify
- [ ] ✅ Todas as variáveis têm escopo **Functions**
- [ ] ✅ Webhook configurado no PagBank
- [ ] ✅ URL do webhook está correta (HTTPS)
- [ ] ✅ Webhook está ativo no PagBank
- [ ] ✅ Deploy feito no Netlify (se necessário)
- [ ] ✅ Teste de checkout funcionando
- [ ] ✅ Status sendo verificado corretamente
- [ ] ✅ Dados sendo salvos no Firestore

---

## 🆘 PRECISA DE AJUDA?

Se tiver problemas:

1. **Verifique os logs:**
   - Netlify Functions: `Functions` → `payment-webhook` → `Logs`
   - Console do navegador: F12 → Console

2. **Teste manualmente:**
   - Acesse: `https://SEU-DOMINIO.netlify.app/.netlify/functions/payment-webhook?checkoutId=TESTE`
   - Deve retornar um JSON (mesmo que com erro)

3. **Verifique a documentação:**
   - Netlify Functions: https://docs.netlify.com/functions/overview/
   - PagBank API: https://dev.pagseguro.uol.com.br/

---

**Pronto!** Com essas configurações, seu sistema de pagamento estará totalmente funcional! 🎉
