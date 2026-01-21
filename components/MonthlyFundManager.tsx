import React, { useState, useMemo, useEffect } from 'react';
import { Member, Transaction, TransactionType } from '../types';
import { CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight, DollarSign, PieChart as PieChartIcon, UserMinus, UserCheck, Trash2, X, AlertTriangle, BarChart as BarChartIcon, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyFundManagerProps {
  members: Member[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateMember: (member: Member) => void;
  isAdmin: boolean;
}

const MonthlyFundManager: React.FC<MonthlyFundManagerProps> = ({ 
  members, 
  transactions, 
  onAddTransaction, 
  onUpdateTransaction, 
  onDeleteTransaction,
  onUpdateMember,
  isAdmin
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputAmounts, setInputAmounts] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const currentMonthStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    setInputAmounts({});
    setConfirmingDelete(null);
  }, [currentMonthStr]);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const fundData = useMemo(() => {
    const monthTransactions = transactions.filter(t => 
      t.category === 'Đóng quỹ tháng' && 
      t.type === TransactionType.INCOME &&
      t.date.startsWith(currentMonthStr)
    );

    const list = members.map(member => {
      const transaction = monthTransactions.find(t => t.relatedMemberId === member.id);
      return {
        member,
        isPaid: !!transaction,
        paidAmount: transaction ? transaction.amount : 0,
        transactionId: transaction ? transaction.id : null,
        transactionData: transaction
      };
    });

    const activeMembers = list.filter(item => item.member.status === 'ACTIVE');
    const totalCollected = activeMembers.reduce((sum, item) => sum + item.paidAmount, 0);
    const paidCount = activeMembers.filter(item => item.isPaid).length;

    const chartData = activeMembers.map(item => ({
      name: item.member.name,
      amount: item.paidAmount,
      isPaid: item.isPaid
    })).sort((a, b) => b.amount - a.amount);

    return { list, totalCollected, paidCount, activeCount: activeMembers.length, chartData };
  }, [members, transactions, currentMonthStr]);

  const handleCreatePayment = (item: typeof fundData.list[0]) => {
    if (!isAdmin) return;
    const amount = inputAmounts[item.member.id] 
      ? Number(inputAmounts[item.member.id]) 
      : item.member.supportLevel;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: `${currentMonthStr}-05`, 
      amount: amount,
      type: TransactionType.INCOME,
      category: 'Đóng quỹ tháng',
      description: `Thu quỹ tháng ${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()} (${item.member.name})`,
      createdBy: 'Admin',
      relatedMemberId: item.member.id,
      relatedMemberName: item.member.name
    };
    onAddTransaction(newTransaction);
    setInputAmounts(prev => {
      const next = { ...prev };
      delete next[item.member.id];
      return next;
    });
  };

  const toggleMemberStatus = (member: Member) => {
    if (!isAdmin) return;
    onUpdateMember({
      ...member,
      status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-red-600" />
          Thu Quỹ Tháng
        </h2>
        
        <div className="flex items-center gap-4">
          {!isAdmin && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Lock size={12}/> Chỉ xem</span>}
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-slate-800 min-w-[140px] text-center">
              Tháng {selectedDate.getMonth() + 1} / {selectedDate.getFullYear()}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="text-slate-500 text-sm font-medium mb-1">Tiến độ đóng (Cầu thủ đang đá)</div>
           <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-800">
                {fundData.paidCount} <span className="text-lg text-slate-400 font-normal">/ {fundData.activeCount}</span>
              </div>
              <PieChartIcon size={40} className="text-blue-500" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="text-slate-500 text-sm font-medium mb-1">Tổng tiền đã thu thực tế</div>
           <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(fundData.totalCollected)}</div>
              <DollarSign size={40} className="text-green-500 opacity-20" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Thành viên</th>
                <th className="px-6 py-4 text-center">Tham gia</th>
                <th className="px-6 py-4">Số tiền đóng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                {isAdmin && <th className="px-6 py-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fundData.list.map((item) => {
                 const isActive = item.member.status === 'ACTIVE';
                 return (
                  <tr key={item.member.id} className={`transition-colors ${!isActive ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.member.name}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        disabled={!isAdmin}
                        onClick={() => toggleMemberStatus(item.member)}
                        className={`p-2 rounded-lg ${isActive ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-200'} ${!isAdmin ? 'cursor-default' : ''}`}
                      >
                        {isActive ? <UserCheck size={20} /> : <UserMinus size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {item.isPaid ? formatCurrency(item.paidAmount) : formatCurrency(item.member.supportLevel)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.isPaid ? (
                        <span className="text-green-600 font-bold text-xs uppercase">Đã đóng</span>
                      ) : (
                        <span className="text-red-500 font-bold text-xs uppercase">Chưa đóng</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        {!item.isPaid && isActive && (
                          <button onClick={() => handleCreatePayment(item)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold">Thu quỹ</button>
                        )}
                        {item.isPaid && (
                          <button onClick={() => onDeleteTransaction(item.transactionId!)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFundManager;