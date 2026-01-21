import React, { useState, useMemo } from 'react';
import { Transaction, Member, TransactionType, Match, MonthlyReport } from '../types';
import TransactionManager from './TransactionManager';
import MonthlyFundManager from './MonthlyFundManager';
import FinancialReports from './FinancialReports';
import { Wallet, CalendarCheck, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface FinanceManagerProps {
  transactions: Transaction[];
  members: Member[];
  matches: Match[];
  monthlyReports: MonthlyReport[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateMember: (member: Member) => void;
  onSaveReport: (report: MonthlyReport) => void;
  onDeleteReport: (id: string) => void;
  isAdmin: boolean;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({
  transactions,
  members,
  matches,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdateMember,
  isAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'MONTHLY' | 'STATS'>('LEDGER');

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><DollarSign size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SỐ DƯ QUỸ ĐỘI</p>
              <p className={`text-3xl font-black ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(stats.balance)}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100"><TrendingUp size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TỔNG TIỀN THU</p>
              <p className="text-2xl font-black text-green-600">{formatCurrency(stats.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100"><TrendingDown size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TỔNG TIỀN CHI</p>
              <p className="text-2xl font-black text-red-600">{formatCurrency(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-200 rounded-[1.25rem] w-full md:w-fit overflow-x-auto scrollbar-hide">
        {[
          { id: 'LEDGER', label: 'Sổ Thu Chi', icon: Wallet },
          { id: 'MONTHLY', label: 'Đóng Quỹ', icon: CalendarCheck },
          { id: 'STATS', label: 'Báo Cáo AI', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'LEDGER' && (
          <TransactionManager transactions={transactions} members={members} onAddTransaction={onAddTransaction} onUpdateTransaction={onUpdateTransaction} onDeleteTransaction={onDeleteTransaction} isAdmin={isAdmin} />
        )}
        {activeTab === 'MONTHLY' && (
          <MonthlyFundManager members={members} transactions={transactions} onAddTransaction={onAddTransaction} onUpdateTransaction={onUpdateTransaction} onDeleteTransaction={onDeleteTransaction} onUpdateMember={onUpdateMember} isAdmin={isAdmin} />
        )}
        {activeTab === 'STATS' && <FinancialReports transactions={transactions} />}
      </div>
    </div>
  );
};

export default FinanceManager;