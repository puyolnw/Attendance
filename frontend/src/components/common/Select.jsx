import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  placeholder = 'เลือก...',
  required = false,
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
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`input-base appearance-none pr-10 cursor-pointer ${
            error ? 'border-bad focus:border-bad focus:ring-bad/30' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...props}
        >
          <option value="" className="bg-elevated">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.id} className="bg-elevated">
              {opt.label ?? opt.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={17}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && <p className="text-bad text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default Select;
