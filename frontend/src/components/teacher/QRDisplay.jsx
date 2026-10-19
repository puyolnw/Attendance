import React from 'react';
import { QrCode, ScanLine, KeyRound } from 'lucide-react';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const QRDisplay = ({ qrCode = null, pin = null, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card title="QR Code และรหัส PIN">
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      </Card>
    );
  }

  return (
    <Card title="QR Code และรหัส PIN">
      <div className="space-y-5">
        {/* QR Code */}
        <div className="flex justify-center">
          {qrCode ? (
            <div className="p-4 bg-white rounded-2xl shadow-glow-sm">
              <img src={qrCode} alt="QR Code" className="w-48 h-48 max-w-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-48 h-48 max-w-full bg-elevated border border-border rounded-2xl mx-auto">
              <QrCode size={40} className="text-muted mb-2" />
              <p className="text-xs text-muted">ไม่มี QR</p>
            </div>
          )}
        </div>

        {/* PIN Code Display */}
        <div className="bg-accent-dim border border-accent/30 rounded-xl p-5">
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted mb-2">
            <KeyRound size={14} className="text-accent" />
            <span>รหัส PIN</span>
          </div>
          <p className="text-center text-4xl font-bold text-accent font-mono tracking-[0.3em]">
            {pin || '------'}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-elevated border border-border rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-ink text-sm">นักเรียนสามารถเช็คชื่อได้โดย:</h4>
          <ul className="space-y-2 text-sm text-ink-dim">
            <li className="flex items-center gap-2">
              <ScanLine size={15} className="text-accent shrink-0" />
              สแกน QR code
            </li>
            <li className="flex items-center gap-2">
              <KeyRound size={15} className="text-accent shrink-0" />
              กรอกรหัส PIN
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default QRDisplay;
