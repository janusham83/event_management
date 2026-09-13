import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import api from '../api';

const AttendanceScanPage = ({ user }) => {
  const [result, setResult] = useState(null);
  const [scanState, setScanState] = useState('idle');

  const handleScan = async (decodedText) => {
    try {
      const response = await api.post('/attendance/scan', {
        function_id: user?.function_id,
        qr_token: decodedText,
      });

      setResult(response.data);
      setScanState(response.data.status || 'success');
    } catch (error) {
      setResult({ status: 'invalid', message: error.response?.data?.message || 'Invalid QR Code' });
      setScanState('invalid');
    }
  };

  const handleNext = () => {
    setResult(null);
    setScanState('idle');
  };

  const getStatusContent = () => {
    if (!result) return null;

    const participant = result.participant || {};

    if (result.status === 'marked') {
      return (
        <div className="result-card success text-center">
          <div className="result-icon">✓</div>
          <h4>ATTENDANCE MARKED</h4>
          <p className="mb-1">{participant.full_name}</p>
          <p className="text-muted">Registration: {participant.registration_number}</p>
          <p className="text-muted">Time: {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
        </div>
      );
    }

    if (result.status === 'already_attended') {
      return (
        <div className="result-card warning text-center">
          <div className="result-icon">⚠</div>
          <h4>ALREADY ATTENDED</h4>
          <p className="mb-1">{participant.full_name}</p>
          <p className="text-muted">Attended: {new Date(result.previous_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
        </div>
      );
    }

    return (
      <div className="result-card danger text-center">
        <div className="result-icon">✕</div>
        <h4>INVALID QR CODE</h4>
        <p>{result.message}</p>
      </div>
    );
  };

  return (
    <div className="row g-4">
      {!result && (
        <div className="col-lg-6">
          <QRScanner onScan={handleScan} title="Attendance Scanner" />
        </div>
      )}
      <div className={result ? 'col-12' : 'col-lg-6'}>
        {result ? (
          <div className="d-flex flex-column gap-3">
            {getStatusContent()}
            <button className="btn btn-primary btn-lg" onClick={handleNext}>Scan Next</button>
          </div>
        ) : (
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-center text-center text-muted p-4">
              <div>
                <h5>Ready to scan</h5>
                <p>Use the mobile camera to scan a participant QR code.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceScanPage;
