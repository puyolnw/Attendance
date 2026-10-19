import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Ban, Home, RotateCw } from 'lucide-react';
import Button from '../components/common/Button';

const ErrorPage = ({ status = 500, message }) => {
  const isForbidden = status === 403;
  const Icon = isForbidden ? Ban : AlertTriangle;
  const heading = isForbidden ? 'ไม่มีสิทธิ์เข้าถึง' : 'เซิร์ฟเวอร์ขัดข้อง';
  const description =
    message ||
    (isForbidden
      ? 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
      : 'เกิดข้อผิดพลาดบางอย่างในระบบ กรุณาลองใหม่อีกครั้งภายหลัง');

  return (
    <div className="min-h-screen bg-base bg-grid-fade flex items-center justify-center px-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-bad/10 border border-bad/30 flex items-center justify-center mb-6">
          <Icon size={30} className="text-bad" />
        </div>

        <h1 className="text-7xl sm:text-8xl font-bold text-ink/10 tracking-tighter leading-none">{status}</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-ink mt-2">{heading}</h2>
        <p className="text-muted text-sm mt-3 mb-8">{description}</p>

        <div className="flex flex-col items-center gap-3">
          <Link to="/">
            <Button variant="primary" size="lg" icon={Home}>
              กลับหน้าหลัก
            </Button>
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            <RotateCw size={15} />
            รีเฟรชหน้า
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
