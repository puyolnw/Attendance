import React from 'react';

const Badge = ({ status, label, className = '', size = 'md', dot = true, pulse = false }) => {
  const styles = {
    present:   'bg-ok/12 text-ok border-ok/25',
    completed: 'bg-ok/12 text-ok border-ok/25',
    active:    'bg-accent-dim text-accent border-accent/25',
    absent:    'bg-bad/12 text-bad border-bad/25',
    late:      'bg-warn/12 text-warn border-warn/25',
    pending:   'bg-info/12 text-info border-info/25',
    inactive:  'bg-muted/12 text-muted border-muted/25',
  };

  const dotColor = {
    present: 'bg-ok', completed: 'bg-ok', active: 'bg-accent',
    absent: 'bg-bad', late: 'bg-warn', pending: 'bg-info', inactive: 'bg-muted',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const style = styles[status] || styles.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || 'bg-muted'} ${pulse ? 'animate-pulse' : ''}`} />}
      {label || status}
    </span>
  );
};

export default Badge;
