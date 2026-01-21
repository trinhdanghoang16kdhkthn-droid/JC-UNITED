import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Mail, Info, History, Clock, Key, Check } from 'lucide-react';
import { AccessRecord } from '../types';

interface AdminSettingsProps {
  adminEmails: string[];
  accessHistory: AccessRecord[];
  systemPassword: string;
  onUpdatePassword: (pass: string) => void;
  onAddAdmin: (email: string) => void;
  onRemoveAdmin: (email: string) => void;
  currentUserEmail: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  adminEmails, 
  accessHistory, 
  systemPassword,
  onUpdatePassword,
  onAddAdmin, 
  onRemoveAdmin, 
  currentUserEmail 
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail && !adminEmails.includes(newEmail)) {
      onAddAdmin(newEmail.toLowerCase().trim());
      setNewEmail('');
    }
  };

  const handleUpdatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length >= 4) {
      onUpdatePassword(newPass);
      setNewPass('');
      setPassUpdated(true);
      setTimeout(() => setPassUpdated(false), 3000);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-[1000] text-slate-900 uppercase tracking-tight">CÀI ĐẶT HỆ THỐNG</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-1">SECURITY & ACCESS CONTROL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Key size={18} className="text-red-600" />
              Bảo mật hệ thống
            </h3>
            <form onSubmit={handleUpdatePass} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu Admin hiện tại</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-400">
                  {systemPassword.replace(/./g, '•')}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập ít nhất 4 ký tự..."
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black font-bold text-sm"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-3 font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                  passUpdated ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-slate-800'
                }`}
              >
                {passUpdated ? <><Check size={18}/> Đã cập nhật</> : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" />
              Thêm quyền Admin
            </h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <input
                type="email"
                required
                placeholder="email@jcunited.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-sm font-bold"
              />
              <button
                type="submit"
                className="w-full py-3 bg-black text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
              >
                Cấp quyền
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List & History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-fit">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">Danh sách Ban cán sự ({adminEmails.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {adminEmails.map((email) => (
                <div key={email} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg"><Mail size={16} className="text-slate-400" /></div>
                    <span className="text-sm font-black text-slate-800">{email}</span>
                  </div>
                  {email !== currentUserEmail && (
                    <button onClick={() => onRemoveAdmin(email)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black flex items-center gap-3 uppercase tracking-[0.2em]">
                <History size={20} className="text-red-500" />
                Nhật ký truy cập hệ thống
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Người dùng</th>
                    <th className="px-6 py-4 text-center">Vai trò</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={14} className="opacity-50" />
                          <span className="text-[11px] font-black">{formatDate(record.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[10px] ${record.role === 'ADMIN' ? 'bg-slate-900' : 'bg-slate-300'}`}>
                            {record.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-800 text-xs uppercase tracking-tight">{record.name}</div>
                            <div className="text-[9px] text-slate-400 font-bold">{record.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          record.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {record.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {accessHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">Chưa có dữ liệu đăng nhập</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;