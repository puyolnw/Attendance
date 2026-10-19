import React, { useRef, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { AlertCircle } from 'lucide-react';

const PINInput = ({ onSubmit, isLoading = false, sessionInfo, error: serverError = '' }) => {
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRefs = useRef([]);

  // Show local validation error first, otherwise the server's Thai message.
  const error = localError || serverError;

  // When a new server error arrives, clear the input so the student can retry.
  useEffect(() => {
    if (serverError) {
      setPin('');
      setLocalError('');
      inputRefs.current[0]?.focus();
    }
  }, [serverError]);

  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = pin.split('');
    newPin[index] = value;
    const newPinString = newPin.join('');
    setPin(newPinString);
    setLocalError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (newPinString.length === 6) {
      handleSubmit(newPinString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pinValue = pin) => {
    if (pinValue.length !== 6) {
      setLocalError('กรุณากรอกให้ครบทั้ง 6 หลัก');
      return;
    }

    setLocalError('');
    try {
      // Parent handles the API call and surfaces the server's Thai error via
      // the `error` prop. Only handle unexpected throws here as a fallback.
      await onSubmit(pinValue);
    } catch (err) {
      setLocalError('PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPin('');
      inputRefs.current[0]?.focus();
    }
  };

  const handleClear = () => {
    setPin('');
    setLocalError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <Card title="กรอก PIN Code">
      <div className="space-y-6">
        {sessionInfo && (
          <div className="bg-accent-dim rounded-xl p-4 text-sm">
            <p className="font-medium text-ink mb-1">{sessionInfo.className}</p>
            <p className="text-xs text-muted">{sessionInfo.sessionTime}</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-center text-muted text-sm">
            กรอก PIN 6 หลักที่อาจารย์ให้มา
          </p>

          <div className="flex justify-center gap-2">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={pin[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold font-mono text-ink bg-elevated rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                    error ? 'border-bad' : 'border-border focus:border-accent'
                  }`}
                />
              ))}
          </div>

          {error && (
            <p className="flex items-center justify-center gap-1.5 text-bad text-sm text-center">
              <AlertCircle size={15} /> {error}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleSubmit()}
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={pin.length !== 6}
          >
            ยืนยัน
          </Button>
          <Button
            onClick={handleClear}
            variant="secondary"
            disabled={isLoading}
          >
            ล้าง
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PINInput;
