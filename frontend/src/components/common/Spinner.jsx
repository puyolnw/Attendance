import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className = '', fullscreen = false, message = '' }) => {
  const px = { sm: 16, md: 28, lg: 44 }[size] || 28;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={px} className={`text-accent animate-spin ${className}`} />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-base/70 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return <div className="py-10 flex justify-center">{spinner}</div>;
};

export default Spinner;
