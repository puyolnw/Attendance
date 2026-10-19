import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Input from '../common/Input';
import { CameraOff, ScanLine, ClipboardPaste } from 'lucide-react';

const QRScanner = ({ onScan, isLoading = false }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const scannedRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [manualData, setManualData] = useState('');

  useEffect(() => {
    let cancelled = false;
    scannedRef.current = false;

    if (!videoRef.current) return undefined;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        // Fire once: stop as soon as a QR is decoded so onScan isn't called
        // on every frame. The parent shows a result screen after a scan.
        if (scannedRef.current) return;
        scannedRef.current = true;
        const text = result?.data ?? result;
        scanner.stop();
        onScan(text);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
      }
    );
    scannerRef.current = scanner;

    scanner
      .start()
      .then(() => {
        if (!cancelled) setCameraReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตการเข้าถึงกล้องแล้วลองใหม่อีกครั้ง');
        console.error('Camera error:', err);
      });

    return () => {
      cancelled = true;
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
    // onScan is intentionally excluded to avoid re-instantiating the scanner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManual = () => {
    const data = manualData.trim();
    if (data) {
      onScan(data);
      setManualData('');
    }
  };

  // Manual/fallback entry: paste the raw QR payload for testing or when the
  // camera is unavailable.
  const manualFallback = (
    <div className="space-y-2">
      <Input
        label="วางข้อมูล QR ที่นี่ (สำหรับทดสอบ)"
        placeholder="วางข้อมูล QR ที่นี่"
        value={manualData}
        onChange={(e) => setManualData(e.target.value)}
        icon={ClipboardPaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitManual();
        }}
      />
      <Button
        onClick={submitManual}
        variant="secondary"
        fullWidth
        loading={isLoading}
        disabled={!manualData.trim()}
      >
        ยืนยันข้อมูล QR
      </Button>
    </div>
  );

  if (error) {
    return (
      <Card title="กล้องผิดพลาด">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-bad/15 flex items-center justify-center shrink-0">
              <CameraOff size={20} className="text-bad" />
            </div>
            <p className="text-bad text-sm">{error}</p>
          </div>
          {manualFallback}
        </div>
      </Card>
    );
  }

  return (
    <Card title="สแกน QR Code">
      <div className="space-y-4">
        <div className="relative bg-base rounded-xl overflow-hidden border border-border">
          <video
            ref={videoRef}
            playsInline
            className="w-full h-80 object-cover"
          />
          {!cameraReady && (
            <div className="absolute inset-0 bg-elevated flex items-center justify-center">
              <Spinner message="กำลังเปิดกล้อง..." />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-accent-dim rounded-xl p-4 text-sm text-ink-dim">
          <ScanLine size={16} className="text-accent shrink-0" />
          <p>วาง QR code ให้อยู่ในกรอบเพื่อสแกน</p>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted mb-2">
            สแกนไม่ได้? วางข้อมูล QR ด้วยตนเอง
          </p>
          {manualFallback}
        </div>
      </div>
    </Card>
  );
};

export default QRScanner;
