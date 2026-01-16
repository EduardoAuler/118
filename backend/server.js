// Backend Node/Express para integração PagBank + Webhook
// Este servidor substitui as Netlify Functions:
// - create-checkout.ts  -> POST  /api/create-checkout
// - payment-webhook.ts  -> GET/POST /api/payment-webhook

// Carregar variáveis de ambiente do arquivo .env (se existir)
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Usaremos fetch nativo (Node 18+). Em provedores como Render/Railway, escolha runtime Node 18 ou superior.
// Se for usar Node < 18 localmente, será preciso adicionar um polyfill de fetch (ex: node-fetch).

// Firebase client SDK (mesmas dependências já usadas no front)
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

// Configuração do PagBank
const PAGBANK_TOKEN = (process.env.PAGBANK_TOKEN || "").trim();
const PAGBANK_API = "https://api.pagseguro.com";

// Configuração do Firebase (reaproveita as mesmas variáveis já usadas no front)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let db = null;
if (firebaseConfig.projectId) {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  console.log("✅ Firebase inicializado no backend Node");
} else {
  console.warn("⚠️ Firebase não configurado no backend (variáveis de ambiente ausentes)");
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Rota raiz
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend PagBank API",
    endpoints: {
      health: "/api/health",
      createCheckout: "POST /api/create-checkout",
      paymentWebhook: "GET/POST /api/payment-webhook"
    }
  });
});

// Healthcheck simples
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "pagbank-backend" });
});

/**
 * POST /api/create-checkout
 * Cria um checkout no PagBank (equivalente à Netlify Function create-checkout.ts)
 */
app.post("/api/create-checkout", async (req, res) => {
  try {
    if (!PAGBANK_TOKEN) {
      console.error(
        "❌ Token PagBank não configurado: defina PAGBANK_TOKEN nas variáveis de ambiente do backend"
      );
      return res
        .status(500)
        .json({ error: "Configuração ausente: PAGBANK_TOKEN" });
    }

    const checkoutData = req.body || {};
    console.log("🚀 Criando checkout no PagBank (backend Node):", checkoutData);

    const response = await fetch(`${PAGBANK_API}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro PagBank:", data);
      return res.status(response.status).json(data);
    }

    console.log("✅ Checkout criado:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Erro na rota /api/create-checkout:", error);
    return res.status(500).json({
      error: "Erro interno",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET/POST /api/payment-webhook
 * - GET  : consulta manual de status (polling)
 * - POST : webhook do PagBank
 * Reimplementação da lógica de netlify/functions/payment-webhook.ts
 */
app.all("/api/payment-webhook", async (req, res) => {
  const method = req.method.toUpperCase();

  try {
    if (!["GET", "POST"].includes(method)) {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // GET: consulta de status de um checkout
    if (method === "GET") {
      const checkoutId = req.query.checkoutId;

      if (!checkoutId) {
        return res
          .status(400)
          .json({ error: "checkoutId é obrigatório na query string" });
      }

      if (!PAGBANK_TOKEN) {
        console.error(
          "❌ Token PagBank não configurado para GET /payment-webhook"
        );
        return res
          .status(500)
          .json({ error: "Configuração ausente: PAGBANK_TOKEN" });
      }

      const statusResponse = await fetch(`${PAGBANK_API}/checkouts/${checkoutId}`, {
        headers: {
          Authorization: `Bearer ${PAGBANK_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!statusResponse.ok) {
        return res
          .status(statusResponse.status)
          .json({ error: "Erro ao consultar checkout" });
      }

      const checkoutData = await statusResponse.json();

      if (db && checkoutData.id) {
        await processPaymentStatus(checkoutData);
      }

      return res.status(200).json({
        success: true,
        checkoutId: checkoutData.id,
        status: checkoutData.status,
        charges: checkoutData.charges || [],
      });
    }

    // POST: webhook do PagBank
    if (!PAGBANK_TOKEN) {
      console.error("❌ Token PagBank não configurado para POST /payment-webhook");
      return res
        .status(500)
        .json({ error: "Configuração ausente: PAGBANK_TOKEN" });
    }

    const webhookData = req.body || {};
    console.log("📥 Webhook recebido do PagBank (backend Node):", webhookData);

    if (!webhookData.id && !webhookData.checkout_id) {
      return res.status(400).json({ error: "Dados do webhook inválidos" });
    }

    const checkoutId = webhookData.id || webhookData.checkout_id;

    const checkoutResponse = await fetch(`${PAGBANK_API}/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${PAGBANK_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!checkoutResponse.ok) {
      console.error("❌ Erro ao consultar checkout:", checkoutResponse.status);
      return res
        .status(checkoutResponse.status)
        .json({ error: "Erro ao consultar checkout" });
    }

    const checkoutData = await checkoutResponse.json();

    console.log("✅ Dados do checkout:", {
      id: checkoutData.id,
      status: checkoutData.status,
      charges: checkoutData.charges?.length || 0,
    });

    if (db) {
      await processPaymentStatus(checkoutData);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processado com sucesso",
      checkoutId: checkoutData.id,
    });
  } catch (error) {
    console.error("❌ Erro em /api/payment-webhook:", error);
    return res.status(500).json({
      error: "Erro interno",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Processa o status do pagamento e salva no Firestore
 * (baseado em netlify/functions/payment-webhook.ts)
 */
async function processPaymentStatus(checkoutData) {
  if (!db) {
    console.warn("⚠️ Firebase não configurado, pulando salvamento");
    return;
  }

  try {
    const checkoutId = checkoutData.id;
    const status = checkoutData.status || "UNKNOWN";
    const charges = checkoutData.charges || [];

    let paymentStatus = "PENDING";
    let paymentMethod = "UNKNOWN";
    let paidAt = null;

    if (charges.length > 0) {
      const lastCharge = charges[charges.length - 1];
      paymentStatus = lastCharge.status || "PENDING";
      paymentMethod = lastCharge.payment_method?.type || "UNKNOWN";

      if (lastCharge.status === "PAID" && lastCharge.paid_at) {
        paidAt = new Date(lastCharge.paid_at);
      }
    } else if (status === "PAID") {
      paymentStatus = "PAID";
    } else if (status === "CANCELLED") {
      paymentStatus = "CANCELLED";
    }

    const paymentDoc = {
      checkoutId,
      status: paymentStatus,
      paymentMethod,
      amount: checkoutData.amount?.value || 0,
      currency: checkoutData.amount?.currency || "BRL",
      customer: checkoutData.customer || {},
      items: checkoutData.items || [],
      charges: charges,
      paidAt: paidAt ? paidAt.toISOString() : null,
      updatedAt: new Date().toISOString(),
      createdAt: checkoutData.created_at || new Date().toISOString(),
    };

    await setDoc(doc(db, "payments", checkoutId), paymentDoc, { merge: true });

    console.log("✅ Status do pagamento salvo:", {
      checkoutId,
      status: paymentStatus,
      paymentMethod,
    });

    if (paymentStatus === "PAID") {
      await updateUserSubscription(checkoutData);
    }
  } catch (error) {
    console.error("❌ Erro ao processar status do pagamento:", error);
    throw error;
  }
}

/**
 * Atualiza a assinatura do usuário quando o pagamento é aprovado
 */
async function updateUserSubscription(checkoutData) {
  try {
    const customerEmail = checkoutData.customer?.email;
    if (!customerEmail) {
      console.warn("⚠️ Email do cliente não encontrado");
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", customerEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("⚠️ Usuário não encontrado com email:", customerEmail);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    await setDoc(
      userDoc.ref,
      {
        subscriptionPlan: "Profissional",
        subscriptionStatus: "active",
        subscriptionPaidAt: new Date().toISOString(),
        subscriptionCheckoutId: checkoutData.id,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("✅ Assinatura do usuário atualizada:", customerEmail);
  } catch (error) {
    console.error("❌ Erro ao atualizar assinatura:", error);
  }
}

// Sempre exportar o app (necessário para Vercel)
// O api/index.js define VERCEL antes de importar
module.exports = app;

// Iniciar servidor local apenas se não estiver no Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend PagBank rodando em http://localhost:${PORT}`);
  });
}

