import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberManager from './components/MemberManager';
import FinanceManager from './components/FinanceManager';
import AIAdvisor from './components/AIAdvisor';
import MatchManager from './components/MatchManager';
import AdminSettings from './components/AdminSettings';
import AuthOverlay from './components/AuthOverlay';
import MonthlyReportArchive from './components/MonthlyReportArchive';
import { AppState, View, Transaction, Member, Match, User, AccessRecord, MonthlyReport } from './types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from './constants';
import { Menu, ShieldCheck, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const savedData = localStorage.getItem('fcManagerData');
    const DEFAULT_ADMINS = ['trinhdanghoang16kdhkthn@gmail.com', 'admin@jcunited.com'];
    const DEFAULT_PASS = '123456';
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (!parsed.adminEmails || parsed.adminEmails.length === 0) parsed.adminEmails = DEFAULT_ADMINS;
      if (!parsed.systemPassword) parsed.systemPassword = DEFAULT_PASS;
      if (!parsed.accessHistory) parsed.accessHistory = [];
      if (!parsed.monthlyReports) parsed.monthlyReports = [];
      return parsed;
    }
    return {
      transactions: INITIAL_TRANSACTIONS,
      members: INITIAL_MEMBERS,
      matches: [],
      monthlyReports: [],
      adminEmails: DEFAULT_ADMINS,
      accessHistory: [],
      systemPassword: DEFAULT_PASS
    };
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('fcUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const isAdmin = state.adminEmails.map(e => e.toLowerCase()).includes(parsedUser.email.toLowerCase());
      setUser({ ...parsedUser, isAdmin });
    }
  }, [state.adminEmails]);

  useEffect(() => {
    localStorage.setItem('fcManagerData', JSON.stringify(state));
  }, [state]);

  const handleLogin = (emailOrId: string, name: string) => {
    const cleanEmail = emailOrId.toLowerCase().trim();
    const isAdmin = state.adminEmails.map(e => e.toLowerCase()).includes(cleanEmail);
    const newUser = { email: cleanEmail, name, isAdmin };
    
    const newRecord: AccessRecord = {
      id: Date.now().toString(),
      name,
      email: isAdmin ? cleanEmail : 'Guest Access',
      timestamp: Date.now(),
      role: isAdmin ? 'ADMIN' : 'GUEST'
    };

    setState(prev => ({
      ...prev,
      accessHistory: [newRecord, ...prev.accessHistory].slice(0, 100)
    }));

    setUser(newUser);
    localStorage.setItem('fcUser', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fcUser');
    setCurrentView('DASHBOARD');
  };

  const saveMonthlyReport = (report: MonthlyReport) => {
    setState(prev => {
      const filtered = prev.monthlyReports.filter(r => r.month !== report.month);
      return { ...prev, monthlyReports: [report, ...filtered] };
    });
  };

  const deleteMonthlyReport = (id: string) => {
    setState(prev => ({ ...prev, monthlyReports: prev.monthlyReports.filter(r => r.id !== id) }));
  };

  // Logic Handlers for other entities (Matches, Members, Transactions)
  const addTransaction = (t: Transaction) => setState(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
  const updateTransaction = (ut: Transaction) => setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === ut.id ? ut : t) }));
  const deleteTransaction = (id: string) => setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  const addMember = (m: Member) => setState(prev => ({ ...prev, members: [...prev.members, m] }));
  const updateMember = (um: Member) => setState(prev => ({ ...prev, members: prev.members.map(m => m.id === um.id ? um : m) }));
  const deleteMember = (id: string) => setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
  const addMatch = (m: Match) => setState(prev => ({ ...prev, matches: [m, ...prev.matches] }));
  const updateMatch = (um: Match) => setState(prev => ({ ...prev, matches: prev.matches.map(m => m.id === um.id ? um : m) }));
  const deleteMatch = (id: string) => setState(prev => ({ ...prev, matches: prev.matches.filter(m => m.id !== id) }));

  const renderContent = () => {
    const isAdmin = user?.isAdmin || false;
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard transactions={state.transactions} members={state.members} matches={state.matches} />;
      case 'MATCHES':
        return <MatchManager matches={state.matches} members={state.members} transactions={state.transactions} onAddMatch={addMatch} onUpdateMatch={updateMatch} onDeleteMatch={deleteMatch} onAddTransaction={addTransaction} isAdmin={isAdmin} />;
      case 'FINANCE':
        return <FinanceManager 
                  transactions={state.transactions} 
                  members={state.members} 
                  matches={state.matches}
                  monthlyReports={state.monthlyReports}
                  onAddTransaction={addTransaction} 
                  onUpdateTransaction={updateTransaction} 
                  onDeleteTransaction={deleteTransaction} 
                  onUpdateMember={updateMember} 
                  onSaveReport={saveMonthlyReport}
                  onDeleteReport={deleteMonthlyReport}
                  isAdmin={isAdmin} 
                />;
      case 'ARCHIVE':
        return <MonthlyReportArchive 
                  transactions={state.transactions} 
                  members={state.members} 
                  matches={state.matches} 
                  monthlyReports={state.monthlyReports} 
                  onSaveReport={saveMonthlyReport} 
                  onDeleteReport={deleteMonthlyReport}
                  isAdmin={isAdmin} 
                />;
      case 'MEMBERS':
        return <MemberManager members={state.members} onAddMember={addMember} onUpdateMember={updateMember} onDeleteMember={deleteMember} isAdmin={isAdmin} />;
      case 'AI_INSIGHTS':
        return <AIAdvisor transactions={state.transactions} members={state.members} matches={state.matches} />;
      case 'SETTINGS':
        return isAdmin ? <AdminSettings adminEmails={state.adminEmails} accessHistory={state.accessHistory} systemPassword={state.systemPassword || '123456'} onUpdatePassword={(p) => setState(prev => ({ ...prev, systemPassword: p }))} onAddAdmin={(e) => setState(prev => ({ ...prev, adminEmails: [...prev.adminEmails, e] }))} onRemoveAdmin={(e) => setState(prev => ({ ...prev, adminEmails: prev.adminEmails.filter(x => x !== e) }))} currentUserEmail={user?.email || ''} /> : null;
      default:
        return <Dashboard transactions={state.transactions} members={state.members} matches={state.matches} />;
    }
  };

  if (!user) return <AuthOverlay onLogin={handleLogin} adminEmails={state.adminEmails} systemPassword={state.systemPassword || '123456'} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded"><span className="text-white font-black text-xs px-1">JC</span></div>
            <h1 className="text-lg font-bold text-slate-800">JC United</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu size={24} /></button>
        </header>
        {!user.isAdmin && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-1 flex items-center justify-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-widest">
            <Lock size={12} /> Chế độ Khách (Chỉ xem)
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;