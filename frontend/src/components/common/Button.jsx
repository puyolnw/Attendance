import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon = null,
  onClick,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-base ' +
    'active:scale-[0.98] disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-accent-gradient text-base shadow-glow-sm hover:shadow-glow focus-visible:ring-accent-ring',
    secondary:
      'bg-elevated text-ink border border-border hover:border-border-strong hover:bg-overlay focus-visible:ring-accent-ring',
    danger:
      'bg-bad/90 text-white hover:bg-bad focus-visible:ring-bad/50',
    ghost:
      'text-ink-dim hover:text-ink hover:bg-elevated focus-visible:ring-accent-ring',
    outline:
      'border border-accent/40 text-accent hover:bg-accent-dim focus-visible:ring-accent-ring',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSize = size === 'lg' ? 20 : 16;

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50' : ''
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} />
      )}
      {children}
    </button>
  );
};

export default Button;
