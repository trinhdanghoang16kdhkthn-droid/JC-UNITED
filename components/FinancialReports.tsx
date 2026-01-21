import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, CreditCard, PieChart as PieChartIcon } from 'lucide-react';

interface FinancialReportsProps {
  transactions: Transaction[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

const FinancialReports: React.FC<FinancialReportsProps> = ({ transactions }) => {
  
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; thu: number; chi: number }> = {};
    
    // Get last 6 months including current
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`, thu: 0, chi: 0 };
    }

    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (months[key]) {
        if (t.type === TransactionType.INCOME) months[key].thu += t.amount;
        else months[key].chi += t.amount;
      }
    });

    return Object.values(months);
  }, [transactions]);

  const expenseDistribution = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const yearStats = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const yearTrans = transactions.filter(t => t.date.startsWith(currentYear));
    const totalThu = yearTrans.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const totalChi = yearTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { totalThu, totalChi, balance: totalThu - totalChi };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Tổng thu năm nay</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{formatCurrency(yearStats.totalThu)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <TrendingDown size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Tổng chi năm nay</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{formatCurrency(yearStats.totalChi)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <CreditCard size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Thặng dư năm</span>
          </div>
          <div className={`text-2xl font-black ${yearStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(yearStats.balance)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" />
            Biểu đồ xu hướng 6 tháng
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend iconType="circle" />
                <Bar name="Tiền Thu" dataKey="thu" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Tiền Chi" dataKey="chi" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-orange-500" />
            Cơ cấu chi tiêu (Tất cả)
          </h3>
          <div className="h-72 w-full flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-2">
              {expenseDistribution.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;