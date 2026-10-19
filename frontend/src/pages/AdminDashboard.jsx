import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, UserCog, BookOpen, UserPlus, Shield, Trash2, AlertCircle } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { formatDate } from '../utils/helpers';
import { userApi } from '../services/endpoints';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', password: '' });

  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [userList, summary] = await Promise.all([
        userApi.list(),
        userApi.summary().catch(() => null),
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      if (summary) {
        setStats(summary);
      } else {
        const list = Array.isArray(userList) ? userList : [];
        setStats({
          totalUsers: list.length,
          totalTeachers: list.filter((u) => u.role === 'teacher').length,
          totalStudents: list.filter((u) => u.role === 'student').length,
          totalClasses: 0,
        });
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setError('');
    try {
      await userApi.create({
        full_name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
      });
      setNewUser({ name: '', email: '', role: 'student', password: '' });
      setShowCreateUserModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.error || 'ไม่สามารถสร้างผู้ใช้ได้');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await userApi.remove(id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const roleLabels = { teacher: 'อาจารย์', student: 'นักเรียน', admin: 'ผู้ดูแลระบบ' };
  const statusLabels = { active: 'ใช้งานอยู่', inactive: 'ปิดใช้งาน' };

  const userColumns = [
    { key: 'name', label: 'ชื่อ' },
    { key: 'email', label: 'อีเมล' },
    {
      key: 'role',
      label: 'บทบาท',
      render: (value) => (
        <Badge
          status={value === 'teacher' ? 'active' : value === 'student' ? 'active' : 'pending'}
          label={roleLabels[value] || value}
        />
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (value) => (
        <Badge
          status={value === 'active' ? 'present' : 'inactive'}
          label={statusLabels[value] || value}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'วันที่เข้าร่วม',
      render: (value) => formatDate(value),
    },
    {
      key: 'id',
      label: '',
      render: (value, row) =>
        row.status === 'active' ? (
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDeleteUser(value)}>
            ปิดใช้งาน
          </Button>
        ) : (
          <span className="text-xs text-muted">ปิดใช้งานแล้ว</span>
        ),
    },
  ];

  const statTiles = [
    { label: 'ผู้ใช้ทั้งหมด', value: stats.totalUsers, icon: Users },
    { label: 'อาจารย์', value: stats.totalTeachers, icon: GraduationCap },
    { label: 'นักเรียน', value: stats.totalStudents, icon: UserCog },
    { label: 'คลาสเรียน', value: stats.totalClasses, icon: BookOpen },
  ];

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm shrink-0">
            <Shield size={22} className="text-base" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="text-muted text-sm mt-1">การจัดการและภาพรวมของระบบ</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics */}
        {isLoading ? (
          <Spinner message="กำลังโหลดแดชบอร์ด..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statTiles.map(({ label, value, icon: Icon }) => (
              <div key={label} className="stat-tile">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{label}</p>
                    <p className="text-3xl font-bold text-ink mt-1">{value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-accent-dim flex items-center justify-center">
                    <Icon size={20} className="text-accent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Management */}
        <Card
          title="จัดการผู้ใช้"
          subtitle="จัดการบัญชีผู้ใช้ทั้งหมดในระบบ"
          action={
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setShowCreateUserModal(true)}
            >
              สร้างผู้ใช้
            </Button>
          }
        >
          <Table
            columns={userColumns}
            data={users}
            isLoading={isLoading}
            emptyMessage="ไม่พบผู้ใช้"
          />
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          title="สร้างผู้ใช้ใหม่"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCreateUserModal(false)}>
                ยกเลิก
              </Button>
              <Button variant="primary" icon={UserPlus} onClick={handleCreateUser}>
                สร้างผู้ใช้
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="ชื่อ-นามสกุล"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="เช่น สมชาย ใจดี"
              required
            />
            <Input
              label="อีเมล"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="เช่น john@example.com"
              required
            />
            <Select
              label="บทบาท"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={[
                { value: 'teacher', label: 'อาจารย์' },
                { value: 'student', label: 'นักเรียน' },
                { value: 'admin', label: 'ผู้ดูแลระบบ' },
              ]}
              required
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="รหัสผ่านชั่วคราว"
              required
            />
          </div>
        </Modal>
      </div>
    </ProtectedLayout>
  );
};

export default AdminDashboard;
