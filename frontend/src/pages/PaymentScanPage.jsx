import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import api from '../api';

const PaymentScanPage = ({ user }) => {
  const [result, setResult] = useState(null);

  const handleScan = async (decodedText) => {
    try {
      const response = await api.post('/payment/scan', {
        function_id: user?.function_id,
        qr_token: decodedText,
      });
      setResult(response.data);
    } catch (error) {
      setResult({ status: 'invalid', message: error.response?.data?.message || 'Invalid QR Code' });
    }
  };

  return (
    <div className="row g-4">
      {!result && (
        <div className="col-lg-6">
          <QRScanner onScan={handleScan} title="Ticket Scanner" />
        </div>
      )}
      <div className={result ? 'col-12' : 'col-lg-6'}>
        {result ? (
          <div className="d-flex flex-column gap-3">
            <div className={`result-card ${result.status === 'paid' ? 'success' : result.status === 'already_paid' ? 'warning' : 'danger'} text-center`}>
              <div className="result-icon">{result.status === 'paid' ? '✓' : result.status === 'already_paid' ? '!' : '✕'}</div>
              <h4>{result.status === 'paid' ? 'PAYMENT COMPLETED' : result.status === 'already_paid' ? 'PAYMENT ALREADY COMPLETED' : 'INVALID QR CODE'}</h4>
              {result.participant && <p>{result.participant.full_name}</p>}
              {result.message && <p className="text-muted">{result.message}</p>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setResult(null)}>Scan Next</button>
          </div>
        ) : (
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-center text-center text-muted p-4">
              <div>
                <h5>Ready to scan</h5>
                <p>Scan a participant QR code to mark payment completed.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentScanPage;