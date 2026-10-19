import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-base bg-grid-fade flex items-center justify-center px-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-accent-dim border border-accent/30 flex items-center justify-center mb-6">
          <Compass size={30} className="text-accent" />
        </div>

        <h1 className="text-7xl sm:text-8xl font-bold text-ink/10 tracking-tighter leading-none">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-ink mt-2">ไม่พบหน้านี้</h2>
        <p className="text-muted text-sm mt-3 mb-8">
          ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link to="/">
            <Button variant="primary" size="lg" icon={Home}>
              กลับหน้าหลัก
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
