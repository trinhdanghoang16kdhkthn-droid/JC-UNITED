import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, AlertCircle, Info, ChevronRight, Mail, Key } from 'lucide-react';

interface AuthOverlayProps {
  onLogin: (email: string, name: string) => void;
  adminEmails: string[];
  systemPassword?: string;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onLogin, adminEmails, systemPassword }) => {
  const [mode, setMode] = useState<'GUEST' | 'ADMIN'>('GUEST');
  const [nameInput, setNameInput] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Vui lòng nhập tên để chúng tôi ghi nhận lịch sử');
      return;
    }
    onLogin(`guest_${Date.now()}`, nameInput.trim());
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.toLowerCase().trim();
    
    if (!cleanEmail) {
      setError('Vui lòng nhập email Admin');
      return;
    }

    if (!adminEmails.includes(cleanEmail)) {
      setError('Email này không có quyền Quản trị viên');
      return;
    }

    if (passwordInput !== systemPassword) {
      setError('Mật khẩu hệ thống không chính xác');
      return;
    }

    const simulatedName = cleanEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    onLogin(cleanEmail, simulatedName);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Banner */}
        <div className="bg-slate-900 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-[120px] font-black leading-none">JC</span>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-slate-800">
              <span className="text-black text-3xl font-[1000] tracking-tighter">JC</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase">JC UNITED</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">MANAGER SYSTEM PRO</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex p-2 bg-slate-100 m-6 rounded-2xl">
          <button 
            onClick={() => { setMode('GUEST'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'GUEST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserIcon size={16} /> Thành viên
          </button>
          <button 
            onClick={() => { setMode('ADMIN'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'ADMIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck size={16} /> Ban cán sự
          </button>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {mode === 'GUEST' ? (
            <form onSubmit={handleGuestLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh tính thành viên</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); setError(null); }}
                    placeholder="Nhập họ và tên..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none transition-all font-bold text-slate-800"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 text-xs"
              >
                Vào hệ thống <ChevronRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email quản trị</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      autoFocus
                      type="email"
                      value={adminEmail}
                      onChange={(e) => { setAdminEmail(e.target.value); setError(null); }}
                      placeholder="admin@jcunited.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hệ thống</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setError(null); }}
                      placeholder="••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-black hover:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 text-xs"
              >
                Xác thực Admin <ChevronRight size={18} />
              </button>
            </form>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl animate-shake border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-[1.5rem] flex gap-4 items-start border border-slate-100">
            <div className="p-2 bg-slate-200 rounded-lg"><Info size={16} className="text-slate-500" /></div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
              Toàn bộ lịch sử truy cập được ghi lại để đảm bảo tính minh bạch. Chỉ Ban cán sự được cấp quyền chỉnh sửa quỹ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;