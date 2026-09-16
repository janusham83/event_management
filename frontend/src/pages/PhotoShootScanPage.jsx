import { useEffect, useState } from 'react';
import QRScanner from '../components/QRScanner';
import api from '../api';

const PhotoShootScanPage = ({ user }) => {
  const [result, setResult] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const availability = getScannerAvailability(user?.function_event, now);

  const handleScan = async (decodedText) => {
    try {
      const response = await api.post('/photo-shoot/scan', {
        function_id: user?.function_id,
        qr_token: decodedText,
      });

      setResult(response.data);
    } catch (error) {
      setResult({ status: 'invalid', message: error.response?.data?.message || 'Invalid QR Code' });
    }
  };

  const handleNext = () => setResult(null);

  return (
    <div className="row g-4">
      {!result && availability.available && (
        <div className="col-lg-6">
          <QRScanner onScan={handleScan} title="Photo Shoot Scanner" />
        </div>
      )}
      <div className={result ? 'col-12' : 'col-lg-6'}>
        {result ? (
          <div className="d-flex flex-column gap-3">
            {result.status === 'completed' ? (
              <div className="result-card success text-center">
                <div className="result-icon">✓</div>
                <h4>PHOTO SHOOT COMPLETED</h4>
                <p>{result.participant.full_name}</p>
                <p className="text-muted">Registration: {result.participant.registration_number}</p>
                <p className="text-muted">Time: {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            ) : result.status === 'already_completed' ? (
              <div className="result-card warning text-center">
                <div className="result-icon">⚠</div>
                <h4>PHOTO SHOOT ALREADY COMPLETED</h4>
                <p>{result.participant.full_name}</p>
                <p className="text-muted">Completed: {new Date(result.previous_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            ) : (
              <div className="result-card danger text-center">
                <div className="result-icon">✕</div>
                <h4>INVALID QR CODE</h4>
                <p>{result.message}</p>
              </div>
            )}
            <button className="btn btn-primary btn-lg" onClick={handleNext}>Scan Next</button>
          </div>
        ) : availability.available ? (
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-center text-center text-muted p-4">
              <div>
                <h5>Ready to scan</h5>
                <p>Use the mobile camera to scan a participant QR code for photo shoot marking.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-center text-center text-muted p-4">
              <div>
                <h5>Scanner unavailable</h5>
                <p>{availability.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getScannerAvailability(functionEvent, now) {
  if (!functionEvent?.date || !functionEvent?.start_time || !functionEvent?.end_time) {
    return { available: false, message: 'No function schedule is assigned to this account.' };
  }
  if (functionEvent.status !== 'active') {
    return { available: false, message: 'This event is inactive. QR scanning is not available.' };
  }

  const date = functionEvent.date.slice(0, 10);
  const start = new Date(`${date}T${functionEvent.start_time}`);
  const end = new Date(`${date}T${functionEvent.end_time}`);
  const opens = new Date(start.getTime() - 2 * 60 * 60 * 1000);
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');

  if (today !== date) return { available: false, message: 'Scanning is available only on the function day.' };
  if (now < opens) return { available: false, message: 'Scanning opens 2 hours before the function start time.' };
  if (now > end) return { available: false, message: 'Scanning has ended for this function.' };
  return { available: true, message: '' };
}

export default PhotoShootScanPage;
