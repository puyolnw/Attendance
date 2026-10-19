import React, { useState } from 'react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import QRScanner from '../components/student/QRScanner';
import PINInput from '../components/student/PINInput';
import Badge from '../components/common/Badge';
import { attendanceApi, statusLabel, statusBadge } from '../services/endpoints';
import { formatTime } from '../utils/helpers';
import { QrCode, KeyRound, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const StudentCheckInPage = () => {
  const [method, setMethod] = useState('qr'); // 'qr' or 'pin'
  const [checkInResult, setCheckInResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const applyResult = (record, ok, message) => {
    if (ok) {
      const status = record?.status || 'present';
      setCheckInResult({
        success: true,
        message: message || 'เช็คชื่อสำเร็จ!',
        checkInTime: record?.check_in_time ? new Date(record.check_in_time) : new Date(),
        status,
      });
    } else {
      setCheckInResult({ success: false, message });
    }
  };

  const handleQRScan = async (qrData) => {
    setIsLoading(true);
    try {
      const record = await attendanceApi.checkInQR(qrData);
      applyResult(record, true);
    } catch (error) {
      console.error('QR check-in failed', error);
      applyResult(
        null,
        false,
        error?.response?.data?.error || 'เช็คชื่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINSubmit = async (pin) => {
    setPinError('');
    setIsLoading(true);
    try {
      const record = await attendanceApi.checkInPIN(pin);
      applyResult(record, true);
    } catch (error) {
      console.error('PIN check-in failed', error);
      const message =
        error?.response?.data?.error || 'PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      setPinError(message);
      applyResult(null, false, message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheckIn = () => {
    setCheckInResult(null);
    setPinError('');
  };

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">เช็คชื่อ</h1>
          <p className="text-muted text-sm mt-1">เช็คชื่อเข้าเรียนสำหรับคาบเรียนวันนี้</p>
        </div>

        {/* Result Notification */}
        {checkInResult && (
          <Card
            className={
              checkInResult.success
                ? 'border-ok/40 shadow-glow-sm'
                : 'border-bad/40'
            }
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  checkInResult.success ? 'bg-ok/15' : 'bg-bad/15'
                }`}
              >
                {checkInResult.success ? (
                  <CheckCircle2 size={24} className="text-ok" />
                ) : (
                  <XCircle size={24} className="text-bad" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">{checkInResult.message}</p>
                {checkInResult.success && (
                  <div className="mt-3 space-y-2 text-sm text-ink-dim">
                    <p>
                      <span className="font-medium text-muted">เวลา:</span>{' '}
                      {formatTime(checkInResult.checkInTime)}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-muted">สถานะ:</span>{' '}
                      <Badge
                        status={statusBadge(checkInResult.status)}
                        label={statusLabel(checkInResult.status)}
                      />
                    </p>
                  </div>
                )}
                <Button
                  onClick={resetCheckIn}
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                  className="mt-4"
                >
                  เช็คชื่ออีกครั้ง
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Method Selector */}
        {!checkInResult && (
          <>
            <Card>
              <div className="space-y-4">
                <p className="text-ink font-medium">เลือกวิธีเช็คชื่อ:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMethod('qr')}
                    className={`p-5 rounded-xl border transition text-left ${
                      method === 'qr'
                        ? 'bg-accent-dim border-accent shadow-glow-sm'
                        : 'bg-elevated border-border hover:border-border-strong'
                    }`}
                  >
                    <QrCode
                      size={28}
                      className={`mb-3 ${method === 'qr' ? 'text-accent' : 'text-muted'}`}
                    />
                    <p className="font-medium text-ink">QR Code</p>
                    <p className="text-sm text-muted">สแกน QR code</p>
                  </button>
                  <button
                    onClick={() => setMethod('pin')}
                    className={`p-5 rounded-xl border transition text-left ${
                      method === 'pin'
                        ? 'bg-accent-dim border-accent shadow-glow-sm'
                        : 'bg-elevated border-border hover:border-border-strong'
                    }`}
                  >
                    <KeyRound
                      size={28}
                      className={`mb-3 ${method === 'pin' ? 'text-accent' : 'text-muted'}`}
                    />
                    <p className="font-medium text-ink">PIN Code</p>
                    <p className="text-sm text-muted">กรอก PIN 6 หลัก</p>
                  </button>
                </div>
              </div>
            </Card>

            {/* QR Scanner or PIN Input */}
            <div className="w-full max-w-md mx-auto space-y-4">
              {method === 'qr' ? (
                <QRScanner onScan={handleQRScan} isLoading={isLoading} />
              ) : (
                <PINInput
                  onSubmit={handlePINSubmit}
                  isLoading={isLoading}
                  error={pinError}
                />
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default StudentCheckInPage;
