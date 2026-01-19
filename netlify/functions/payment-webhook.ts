import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TS no ambiente de functions pode não ter os tipos de fetch disponíveis
declare const fetch: any;

// Configuração do Firebase (usar variáveis de ambiente)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializar Firebase apenas se as variáveis estiverem configuradas
let db: any = null;
if (firebaseConfig.projectId) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

const PAGBANK_TOKEN = (process.env.PAGBANK_TOKEN || process.env.REACT_APP_PAGBANK_TOKEN || '').trim();
// Suporta sandbox via variável de ambiente (PAGBANK_SANDBOX=true usa sandbox)
const USE_SANDBOX = process.env.PAGBANK_SANDBOX === 'true';
const PAGBANK_API = USE_SANDBOX 
  ? 'https://sandbox.api.pagseguro.com' 
  : 'https://api.pagseguro.com';

/**
 * Handler para webhooks do PagBank
 * Recebe notificações de mudança de status de pagamento
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Apenas POST e GET são aceitos
  if (!['POST', 'GET'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // GET: Verificação de status manual (para polling)
    if (event.httpMethod === 'GET') {
      const checkoutId = event.queryStringParameters?.checkoutId;
      
      if (!checkoutId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'checkoutId é obrigatório' }),
        };
      }

      // Consultar status no PagBank
      const statusResponse = await fetch(`${PAGBANK_API}/checkouts/${checkoutId}`, {
        headers: {
          'Authorization': `Bearer ${PAGBANK_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        return {
          statusCode: statusResponse.status,
          headers,
          body: JSON.stringify({ error: 'Erro ao consultar checkout' }),
        };
      }

      const checkoutData = await statusResponse.json();
      
      // Processar e salvar status no Firebase se disponível
      if (db && checkoutData.id) {
        await processPaymentStatus(checkoutData);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          checkoutId: checkoutData.id,
          status: checkoutData.status,
          charges: checkoutData.charges || []
        }),
      };
    }

    // POST: Webhook do PagBank
    const webhookData = JSON.parse(event.body || '{}');
    
    console.log('📥 Webhook recebido do PagBank:', webhookData);

    // Validar estrutura do webhook
    if (!webhookData.id && !webhookData.checkout_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados do webhook inválidos' }),
      };
    }

    const checkoutId = webhookData.id || webhookData.checkout_id;

    // Consultar dados completos do checkout no PagBank
    const checkoutResponse = await fetch(`${PAGBANK_API}/checkouts/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkoutResponse.ok) {
      console.error('❌ Erro ao consultar checkout:', checkoutResponse.status);
      return {
        statusCode: checkoutResponse.status,
        headers,
        body: JSON.stringify({ error: 'Erro ao consultar checkout' }),
      };
    }

    const checkoutData = await checkoutResponse.json();
    
    console.log('✅ Dados do checkout:', {
      id: checkoutData.id,
      status: checkoutData.status,
      charges: checkoutData.charges?.length || 0
    });

    // Processar e salvar status no Firebase
    if (db) {
      await processPaymentStatus(checkoutData);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        checkoutId: checkoutData.id
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Processa o status do pagamento e salva no Firebase
 */
async function processPaymentStatus(checkoutData: any) {
  if (!db) {
    console.warn('⚠️ Firebase não configurado, pulando salvamento');
    return;
  }

  try {
    const checkoutId = checkoutData.id;
    const status = checkoutData.status || 'UNKNOWN';
    const charges = checkoutData.charges || [];
    
    // Determinar status geral do pagamento
    let paymentStatus = 'PENDING';
    let paymentMethod = 'UNKNOWN';
    let paidAt = null;

    if (charges.length > 0) {
      const lastCharge = charges[charges.length - 1];
      paymentStatus = lastCharge.status || 'PENDING';
      paymentMethod = lastCharge.payment_method?.type || 'UNKNOWN';
      
      if (lastCharge.status === 'PAID' && lastCharge.paid_at) {
        paidAt = new Date(lastCharge.paid_at);
      }
    } else if (status === 'PAID') {
      paymentStatus = 'PAID';
    } else if (status === 'CANCELLED') {
      paymentStatus = 'CANCELLED';
    }

    // Salvar no Firestore
    const paymentDoc = {
      checkoutId,
      status: paymentStatus,
      paymentMethod,
      amount: checkoutData.amount?.value || 0,
      currency: checkoutData.amount?.currency || 'BRL',
      customer: checkoutData.customer || {},
      items: checkoutData.items || [],
      charges: charges,
      paidAt: paidAt ? paidAt.toISOString() : null,
      updatedAt: new Date().toISOString(),
      createdAt: checkoutData.created_at || new Date().toISOString(),
    };

    // Salvar na coleção de pagamentos
    await setDoc(
      doc(db, 'payments', checkoutId),
      paymentDoc,
      { merge: true }
    );

    console.log('✅ Status do pagamento salvo:', {
      checkoutId,
      status: paymentStatus,
      paymentMethod
    });

    // Se o pagamento foi aprovado, atualizar status do usuário
    if (paymentStatus === 'PAID') {
      await updateUserSubscription(checkoutData);
    }

  } catch (error) {
    console.error('❌ Erro ao processar status do pagamento:', error);
    throw error;
  }
}

/**
 * Atualiza a assinatura do usuário quando o pagamento é aprovado
 */
async function updateUserSubscription(checkoutData: any) {
  try {
    const customerEmail = checkoutData.customer?.email;
    if (!customerEmail) {
      console.warn('⚠️ Email do cliente não encontrado');
      return;
    }

    // Buscar usuário por email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', customerEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('⚠️ Usuário não encontrado com email:', customerEmail);
      return;
    }

    // Atualizar primeiro usuário encontrado
    const userDoc = querySnapshot.docs[0];
    await setDoc(
      userDoc.ref,
      {
        subscriptionPlan: 'Profissional',
        subscriptionStatus: 'active',
        subscriptionPaidAt: new Date().toISOString(),
        subscriptionCheckoutId: checkoutData.id,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log('✅ Assinatura do usuário atualizada:', customerEmail);

  } catch (error) {
    console.error('❌ Erro ao atualizar assinatura:', error);
  }
}

export { handler };
