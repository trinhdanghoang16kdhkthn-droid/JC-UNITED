import React from 'react';
import { LayoutDashboard, Wallet, Users, Sparkles, LogOut, ShieldCheck, Trophy, Settings, LogIn, FileArchive } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen, user, onLogout }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'TỔNG QUAN', icon: LayoutDashboard },
    { id: 'MATCHES', label: 'LỊCH SỬ THI ĐẤU', icon: Trophy },
    { id: 'FINANCE', label: 'QUẢN LÝ TÀI CHÍNH', icon: Wallet },
    { id: 'ARCHIVE', label: 'KHO BÁO CÁO', icon: FileArchive },
    { id: 'MEMBERS', label: 'THÀNH VIÊN ĐỘI', icon: Users },
    { id: 'AI_INSIGHTS', label: 'TRỢ LÝ AI', icon: Sparkles },
  ];

  if (user?.isAdmin) {
    menuItems.push({ id: 'SETTINGS', label: 'CÀI ĐẶT HỆ THỐNG', icon: Settings });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#0a0f1e] text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0 border-r border-slate-800/50
      `}>
        <div className="flex flex-col h-full">
          {/* Logo JC - Siêu đậm, thẳng */}
          <div className="p-8 border-b border-slate-800/50 flex items-center gap-4">
            <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transform hover:rotate-6 transition-transform">
              <span className="text-black text-4xl font-[1000] tracking-tighter leading-none select-none">JC</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white leading-none tracking-tight">UNITED</h1>
              <span className="text-[9px] text-slate-500 font-black tracking-[0.3em] mt-2 uppercase">MANAGER PRO</span>
            </div>
          </div>

          <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-white text-black shadow-2xl font-black scale-[1.05] z-10' 
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-black' : 'text-slate-500 group-hover:text-slate-200'} />
                  <span className="text-[11px] font-black tracking-[0.1em]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-5 border-t border-slate-800/50 bg-[#070b16]">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                  <div className="relative">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full border-2 border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white border-2 border-slate-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.isAdmin && (
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-900 shadow-sm" title="Quản trị viên">
                        <ShieldCheck size={10} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black truncate text-xs uppercase tracking-tight">{user.name}</p>
                    <p className="text-slate-500 text-[9px] truncate uppercase font-black tracking-widest">{user.isAdmin ? 'ADMIN ACCESS' : 'VIEWER'}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-slate-900/50 hover:bg-red-900/20 text-slate-500 hover:text-red-400 border border-slate-800/50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <LogOut size={14} /> ĐĂNG XUẤT
                </button>
              </div>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                <LogIn size={14} /> ĐĂNG NHẬP
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;