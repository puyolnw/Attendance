import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, ScanLine } from 'lucide-react';

const ROLE_LABEL = { teacher: 'อาจารย์', student: 'นักเรียน', admin: 'ผู้ดูแลระบบ' };

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
      <div className="px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm">
            <ScanLine size={19} className="text-base" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink leading-tight tracking-tight">RoboFlow</h1>
            <p className="text-[11px] text-muted -mt-0.5">ระบบเช็คชื่อ</p>
          </div>
        </div>

        {user && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-elevated transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center text-xs font-semibold text-accent">
                {initials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink leading-tight">{user.name}</p>
                <p className="text-[11px] text-muted">{ROLE_LABEL[user.role] || user.role}</p>
              </div>
              <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-elevated overflow-hidden animate-slide-up">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink-dim hover:text-bad hover:bg-elevated transition-colors"
                >
                  <LogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
