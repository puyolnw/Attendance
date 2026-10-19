import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  title,
  subtitle,
  action,
  footer,
  padding = true,
  ...props
}) => {
  const hover = hoverable
    ? 'hover:border-border-strong hover:shadow-elevated cursor-pointer'
    : '';

  return (
    <div
      className={`surface-card transition-all ${hover} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
      {footer && (
        <div className="border-t border-border px-5 py-4 bg-elevated/40 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
