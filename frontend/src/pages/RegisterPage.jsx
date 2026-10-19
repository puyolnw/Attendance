import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Mail, Lock, User, ScanLine, AlertCircle, ArrowRight, GraduationCap, Presentation } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const routeFor = (role) => (role === 'teacher' ? '/teacher' : '/student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      const user = res.data.data;
      login(user, res.data.accessToken);
      navigate(routeFor(user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'นักเรียน', icon: GraduationCap },
    { value: 'teacher', label: 'อาจารย์', icon: Presentation },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-base bg-grid-fade p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-glow mb-4">
            <ScanLine size={28} className="text-base" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">สร้างบัญชี</h1>
          <p className="text-sm text-muted mt-1">สมัครใช้งานระบบเช็คชื่อ RoboFlow</p>
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
              <label className="block text-sm font-medium text-ink-dim mb-1.5">ชื่อ-นามสกุล</label>
              <div className="relative">
                <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="ชื่อ นามสกุล" className="input-base pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-dim mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" className="input-base pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-dim mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type="password" value={form.password} onChange={set('password')}
                  placeholder="••••••••" className="input-base pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-dim mb-1.5">ฉันคือ</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const active = form.role === r.value;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                      className={`flex flex-col items-center gap-2 py-3.5 rounded-lg border transition-all ${
                        active
                          ? 'border-accent bg-accent-dim text-accent shadow-glow-sm'
                          : 'border-border bg-elevated text-ink-dim hover:border-border-strong'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent-gradient text-base font-semibold py-3 rounded-lg shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
