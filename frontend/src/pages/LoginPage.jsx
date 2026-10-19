import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Mail, Lock, ScanLine, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const routeFor = (role) =>
    role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/student';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data.data;
      login(user, res.data.accessToken);
      navigate(routeFor(user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base bg-grid-fade p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-glow mb-4">
            <ScanLine size={28} className="text-base" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">ยินดีต้อนรับกลับ</h1>
          <p className="text-sm text-muted mt-1">เข้าสู่ระบบเช็คชื่อ RoboFlow</p>
        </div>

        <div className="surface-card p-7">
          {error && (
            <div className="flex items-center gap-2 bg-bad/10 border border-bad/25 text-bad text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-dim mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-base pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-dim mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent-gradient text-base font-semibold py-3 rounded-lg shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-accent font-medium hover:text-accent-hover">
            สร้างบัญชี
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
