import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan, onError, title = 'Scan QR Code' }) => {
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const scanHandledRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');

  onScanRef.current = onScan;
  onErrorRef.current = onError;

  const startScanner = async () => {
    if (!scannerRef.current || isStarting || isScanning) return;

    setIsStarting(true);
    setCameraError('');

    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('Camera access is not supported by this browser.');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!devices.some((device) => device.kind === 'videoinput')) {
        throw new Error('This device does not have a camera.');
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerInstanceRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;
          await html5QrCode.stop().catch(() => {});
          scannerInstanceRef.current = null;
          setIsScanning(false);
          onScanRef.current(decodedText);
        }
      );
      scanHandledRef.current = false;
      setIsScanning(true);
    } catch (error) {
      const message = error.message === 'This device does not have a camera.'
        ? error.message
        : error.message === 'Camera access is not supported by this browser.'
          ? error.message
          : error.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access in your browser settings and reload this page.'
            : error.name === 'NotFoundError'
              ? 'No camera was found on this device.'
              : 'Camera could not be opened. Check that it is not being used by another app.';
      setCameraError(message);
      onErrorRef.current?.(message);
      scannerInstanceRef.current = null;
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      scannerInstanceRef.current?.stop().catch(() => {});
    };
  }, []);

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
          <div ref={scannerRef} id="qr-reader" style={{ width: '100%', minHeight: '340px' }} />
          {cameraError && (
            <div className="camera-unavailable" role="alert">
              <i className="bi bi-camera-video-off"></i>
              <strong>Camera unavailable</strong>
              <span>{cameraError}</span>
            </div>
          )}
          {!cameraError && isScanning && <div className="scanner-frame"></div>}
        </div>
        <div className="d-flex justify-content-center mt-3">
          {isScanning && <span className="text-muted">Point the camera at a QR code to scan.</span>}
          {!isScanning && cameraError && <button className="btn btn-outline-primary" type="button" onClick={startScanner} disabled={isStarting}>Try Camera Again</button>}
        </div>
        <small className="text-muted d-block mt-2 text-center">The camera will stop after one successful scan.</small>
      </div>
    </div>
  );
};

export default QRScanner;
