import React, { useState } from 'react';
import { Transaction, TransactionType, Member } from '../types';
import { CATEGORIES_EXPENSE, CATEGORIES_INCOME } from '../constants';
import { Plus, Filter, Trash2, Edit2, ArrowUpCircle, ArrowDownCircle, User, AlertCircle, Clock, Zap, Target, Star, Gift, Lock, X } from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  members: Member[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  isAdmin: boolean;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, members, onAddTransaction, onUpdateTransaction, onDeleteTransaction, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

  // Form State
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES_EXPENSE[0]);
  const [description, setDescription] = useState('');
  const [relatedMemberId, setRelatedMemberId] = useState<string>('');

  const isFineOrIndividualReward = category.includes('Phạt') || category === 'Thưởng thành viên';

  const startEdit = (t: Transaction) => {
    if (!isAdmin) return;
    setEditingId(t.id);
    setType(t.type);
    setAmount(t.amount.toString());
    setDate(t.date);
    setCategory(t.category);
    setDescription(t.description);
    setRelatedMemberId(t.relatedMemberId || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount('');
    setDescription('');
    setRelatedMemberId('');
    setShowForm(false);
  };

  const handleQuickAction = (action: any) => {
    if (!isAdmin) return;
    setType(action.type);
    setCategory(action.cat);
    setAmount(action.amount);
    setDescription(action.label);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    let finalDescription = description;
    let memberName = '';

    if (relatedMemberId) {
      const member = members.find(m => m.id === relatedMemberId);
      if (member) {
        memberName = member.name;
        if (!finalDescription.includes(member.name)) {
          finalDescription = finalDescription ? `${finalDescription} (${member.name})` : member.name;
        }
      }
    }

    if (editingId) {
      onUpdateTransaction({
        id: editingId,
        date,
        amount: Number(amount),
        type,
        category,
        description: finalDescription,
        createdBy: 'Admin',
        relatedMemberId: relatedMemberId || undefined,
        relatedMemberName: memberName || undefined
      });
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date,
        amount: Number(amount),
        type,
        category,
        description: finalDescription,
        createdBy: 'Admin',
        relatedMemberId: relatedMemberId || undefined,
        relatedMemberName: memberName || undefined
      };
      onAddTransaction(newTransaction);
    }
    resetForm();
  };

  const filteredTransactions = transactions
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-800">Sổ Thu Chi Đội Bóng</h2>
        {isAdmin ? (
          <button 
            onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
            className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-bold"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span>{showForm ? 'Đóng form' : 'Ghi nhận giao dịch'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
            <Lock size={14} /> Chế độ chỉ xem
          </div>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in-down">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">{editingId ? 'Cập nhật giao dịch' : 'Ghi nhận giao dịch mới'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 flex gap-3 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-md' : 'text-slate-400'}`}
                onClick={() => { setType(TransactionType.INCOME); setCategory(CATEGORIES_INCOME[0]); }}
              >
                Thu quỹ / Tiền phạt
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-md' : 'text-slate-400'}`}
                onClick={() => { setType(TransactionType.EXPENSE); setCategory(CATEGORIES_EXPENSE[0]); }}
              >
                Chi tiền sân / Liên hoan
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Số tiền (VNĐ)</label>
              <input 
                type="number" required min="0" step="10000"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="VD: 50000"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Ngày giao dịch</label>
              <input 
                type="date" required value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Danh mục</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold"
              >
                {(type === TransactionType.INCOME ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Thành viên liên quan</label>
              <select 
                required={isFineOrIndividualReward}
                value={relatedMemberId} onChange={e => setRelatedMemberId(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-black outline-none font-bold ${isFineOrIndividualReward && !relatedMemberId ? 'border-red-300' : 'border-slate-200'}`}
              >
                <option value="">-- Chọn thành viên (nếu có) --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mô tả chi tiết</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Nhập nội dung giao dịch..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-sm h-20"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl uppercase text-xs tracking-widest">Hủy</button>
              <button type="submit" className="px-10 py-2.5 bg-black text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase text-xs tracking-widest">
                {editingId ? 'Cập nhật giao dịch' : 'Xác nhận lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions Panel */}
      {!showForm && isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Gift size={14} /> Ghi nhận nhanh các khoản phạt
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Phạt đi trễ', icon: Clock, cat: 'Phạt đi trễ', type: TransactionType.INCOME, color: 'text-orange-600 bg-orange-50 border-orange-100', amount: '20000' },
              { label: 'Phạt bỏ trận', icon: Zap, cat: 'Phạt bỏ trận', type: TransactionType.INCOME, color: 'text-red-600 bg-red-50 border-red-100', amount: '50000' },
              { label: 'Phạt ít đá', icon: Target, cat: 'Phạt ít đá', type: TransactionType.INCOME, color: 'text-amber-600 bg-amber-50 border-amber-100', amount: '30000' },
              { label: 'Thưởng nóng', icon: Star, cat: 'Thưởng thành viên', type: TransactionType.EXPENSE, color: 'text-blue-600 bg-blue-50 border-blue-100', amount: '50000' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-xs font-black uppercase tracking-tight transition-all hover:shadow-md active:scale-95 ${action.color}`}
              >
                <action.icon size={24} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-700 uppercase text-xs tracking-[0.1em]">Lịch sử giao dịch quỹ đội</h3>
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-[11px] border border-slate-200 bg-white rounded-lg px-3 py-1.5 focus:ring-0 text-slate-600 font-black uppercase tracking-widest"
            >
              <option value="ALL">Tất cả</option>
              <option value={TransactionType.INCOME}>Thu vào (+)</option>
              <option value={TransactionType.EXPENSE}>Chi ra (-)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Nội dung / Thành viên</th>
                <th className="px-6 py-4 text-right">Biến động</th>
                {isAdmin && <th className="px-6 py-4 text-center">Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-5 text-slate-500 font-bold text-xs">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      t.category.includes('Phạt') ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                      t.category === 'Thưởng thành viên' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      t.type === TransactionType.INCOME ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-xs">{t.description}</div>
                    {t.relatedMemberName && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                        <User size={10}/> {t.relatedMemberName}
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-5 text-right font-black text-base ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount).replace('₫', '')}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => startEdit(t)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Sửa giao dịch"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa giao dịch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">Không tìm thấy dữ liệu giao dịch</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;