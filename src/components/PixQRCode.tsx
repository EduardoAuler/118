import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface PixQRCodeProps {
  qrCode: string;
  orderId: string;
  amount: number;
  onClose: () => void;
}

const PixQRCode: React.FC<PixQRCodeProps> = ({ qrCode, orderId, amount, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="pix-qr-modal">
      <div className="pix-qr-content">
        <div className="pix-qr-header">
          <h3>Pagamento PIX</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pix-qr-body">
          <div className="pix-info">
            <div className="amount">R$ {amount.toFixed(2).replace('.', ',')}</div>
            <div className="order-id">Pedido: {orderId}</div>
          </div>

          <div className="qr-code-container">
            <QRCode
              value={qrCode}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="pix-instructions">
            <p>1. Abra o app do seu banco</p>
            <p>2. Escaneie o QR Code ou copie o código PIX</p>
            <p>3. Confirme o pagamento</p>
          </div>

          <div className="pix-code-section">
            <label>Código PIX:</label>
            <div className="code-container">
              <code className="pix-code">{qrCode}</code>
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyToClipboard}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        <div className="pix-qr-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixQRCode;
