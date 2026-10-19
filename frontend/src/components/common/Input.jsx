import React from 'react';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  icon: Icon = null,
  hint,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-ink-dim mb-1.5">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`input-base ${Icon ? 'pl-10' : ''} ${
            error ? 'border-bad focus:border-bad focus:ring-bad/30' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-bad text-xs mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-muted text-xs mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
};

export default Input;
