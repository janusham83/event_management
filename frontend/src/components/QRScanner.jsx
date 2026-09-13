import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan, onError, title = 'Scan QR Code' }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      if (!scannerRef.current) return;

      html5QrCode = new Html5Qrcode('qr-reader');
      setIsScanning(true);

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            onScan(decodedText);
          },
          (errorMessage) => {
            onError?.(errorMessage);
          }
        );
      } catch (error) {
        onError?.(error.message || 'Camera unavailable');
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
      setIsScanning(false);
    };
  }, [onScan, onError]);

  return (
    <div className="scanner-panel card border-0 shadow-sm">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <span className={`badge ${isScanning ? 'bg-success' : 'bg-secondary'}`}>
            {isScanning ? 'Live' : 'Standby'}
          </span>
        </div>
        <div className="scanner-shell position-relative rounded-4 overflow-hidden bg-dark">
          <div id="qr-reader" style={{ width: '100%', minHeight: '340px' }} />
          <div className="scanner-frame"></div>
        </div>
        <small className="text-muted d-block mt-2 text-center">Point the camera at the participant QR code.</small>
      </div>
    </div>
  );
};

export default QRScanner;
