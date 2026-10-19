import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, BookOpen, QrCode, History, Search,
  Users, GraduationCap, Library, FileBarChart, PlusCircle, CalendarRange,
} from 'lucide-react';

const NAV = {
  teacher: [
    { label: 'แดชบอร์ด', path: '/teacher', icon: LayoutDashboard, exact: true },
    { label: 'ตารางสอน', path: '/teacher/schedule', icon: CalendarRange, exact: true },
    { label: 'คลาสของฉัน', path: '/teacher/classes', icon: Library, exact: true },
    { label: 'สร้างคลาสเรียน', path: '/teacher/classes/create', icon: PlusCircle },
    { label: 'รายงาน', path: '/teacher/reports', icon: FileBarChart, exact: true },
  ],
  student: [
    { label: 'แดชบอร์ด', path: '/student', icon: LayoutDashboard, exact: true },
    { label: 'ตารางเรียน', path: '/student/schedule', icon: CalendarRange, exact: true },
    { label: 'คลาสเรียนของฉัน', path: '/student/classes', icon: Library },
    { label: 'ลงทะเบียนเรียน', path: '/student/enroll', icon: PlusCircle },
    { label: 'เช็คชื่อ', path: '/student/checkin', icon: QrCode },
    { label: 'ประวัติ', path: '/student/history', icon: History },
  ],
  admin: [
    { label: 'แดชบอร์ด', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'จัดการผู้ใช้', path: '/admin/users', icon: Users },
  ],
};

const Sidebar = ({ isOpen = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  const links = NAV[user?.role] || [];

  const isActive = (link) =>
    link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-0'} h-full shrink-0 bg-surface border-r border-border transition-all duration-300 overflow-hidden`}
    >
      <nav className="p-4 h-full flex flex-col">
        <div className="space-y-2">
          <p className="px-3 mb-3 text-xs font-semibold text-muted uppercase tracking-wider">
เมนู
          </p>
          {links.map((link) => {
            const active = isActive(link);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`group flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                  active
                    ? 'bg-accent-dim text-accent shadow-glow-sm'
                    : 'text-ink-dim hover:text-ink hover:bg-elevated'
                }`}
              >
                <Icon size={18} className={active ? 'text-accent' : 'text-muted group-hover:text-ink'} />
                {link.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse-ring" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-elevated/50">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center shrink-0">
              <GraduationCap size={16} className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-muted capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
