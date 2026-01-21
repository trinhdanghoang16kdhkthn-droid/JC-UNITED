import React, { useMemo } from 'react';
import { Transaction, TransactionType, Member, Match } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Trophy, UserCheck } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  members: Member[];
  matches: Match[];
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, members, matches }) => {
  
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
    
    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const matchExpenses = transactions
      .filter(t => t.relatedMatchId && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return { 
      totalIncome, 
      totalExpense, 
      balance, 
      activeMembers, 
      completedMatches,
      matchExpenses 
    };
  }, [transactions, members, matches]);

  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const categoryMap = new Map<string, number>();

    expenses.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const attendanceData = useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'ACTIVE');
    const completedMatches = matches.filter(m => m.status === 'COMPLETED');
    
    return activeMembers.map(m => {
      const matchCount = completedMatches.filter(match => 
        match.participantIds?.includes(m.id)
      ).length;
      return {
        name: m.name,
        'Số trận': matchCount
      };
    }).sort((a, b) => b['Số trận'] - a['Số trận']).slice(0, 8); // Top 8 siêng năng nhất
  }, [members, matches]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Trung tâm điều hành Quỹ Đội</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Hệ thống hoạt động bình thường
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Số dư khả dụng</span>
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <span className={`text-2xl font-black ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
            {formatCurrency(stats.balance)}
          </span>
          <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase">JC United Treasury</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tổng thu tích lũy</span>
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-2xl font-black text-green-600">{formatCurrency(stats.totalIncome)}</span>
          <div className="mt-2 text-[10px] text-green-400 font-bold uppercase">Cash Inflow</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tổng chi tích lũy</span>
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <TrendingDown size={18} />
            </div>
          </div>
          <span className="text-2xl font-black text-red-600">{formatCurrency(stats.totalExpense)}</span>
          <div className="mt-2 text-[10px] text-red-400 font-bold uppercase">Cash Outflow</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hoạt động thi đấu</span>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
              <Trophy size={18} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-800">{stats.completedMatches} trận</span>
            <span className="text-[10px] text-slate-400 font-black uppercase mt-1">Chi sân: {formatCurrency(stats.matchExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <UserCheck className="text-blue-500" /> Top Chuyên Cần (Số Trận)
          </h3>
          <div className="h-72">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Số trận" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1E293B' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={40} className="mb-2 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu điểm danh</span>
              </div>
            )}
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <TrendingDown className="text-red-500" /> Phân bổ dòng tiền chi
          </h3>
          <div className="h-72">
             {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <DollarSign size={40} className="mb-2 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu chi tiêu</span>
              </div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">Nhật ký giao dịch mới nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4 text-right">Biến động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-500">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 text-xs">{t.category}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[300px] mt-0.5">{t.description}</div>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount).replace('₫', '')}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic font-bold text-xs uppercase tracking-widest">Dữ liệu trống</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;