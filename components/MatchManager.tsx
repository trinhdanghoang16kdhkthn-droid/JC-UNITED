
import React, { useState, useMemo, useEffect } from 'react';
import { Match, MatchType, Transaction, TransactionType, Member } from '../types';
// Added AlertTriangle to the lucide-react import list
import { Plus, Calendar, MapPin, Trophy, Trash2, CheckCircle2, XCircle, Clock, DollarSign, ReceiptText, BarChart3, Info, Lock, Award, Users, UserCheck, Edit3, X, Save, AlertTriangle } from 'lucide-react';

interface MatchManagerProps {
  matches: Match[];
  members: Member[];
  transactions: Transaction[];
  onAddMatch: (match: Match) => void;
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  onAddTransaction: (transaction: Transaction) => void;
  isAdmin: boolean;
}

const MatchManager: React.FC<MatchManagerProps> = ({ matches, members, transactions, onAddMatch, onUpdateMatch, onDeleteMatch, onAddTransaction, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('Sân bóng Thành Phát');
  const [type, setType] = useState<MatchType>(MatchType.INTERNAL);
  const [opponent, setOpponent] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [homeScore, setHomeScore] = useState<string>('0');
  const [awayScore, setAwayScore] = useState<string>('0');

  // Expense Form State
  const [pitchFee, setPitchFee] = useState('500000');
  const [waterFee, setWaterFee] = useState('50000');
  const [otherFee, setOtherFee] = useState('0');

  useEffect(() => {
    if (editingMatch) {
      setDate(editingMatch.date);
      setTime(editingMatch.time);
      setLocation(editingMatch.location);
      setType(editingMatch.type);
      setOpponent(editingMatch.opponent || '');
      setDescription(editingMatch.description || '');
      setSelectedParticipants(editingMatch.participantIds || []);
      
      if (editingMatch.result && editingMatch.result !== 'Chưa cập nhật') {
        const scores = editingMatch.result.split('-').map(s => s.trim());
        setHomeScore(scores[0] || '0');
        setAwayScore(scores[1] || '0');
      } else {
        setHomeScore('0');
        setAwayScore('0');
      }
    }
  }, [editingMatch]);

  const stats = useMemo(() => {
    const completedMatches = matches.filter(m => m.status === 'COMPLETED');
    const totalMatches = completedMatches.length;
    const internalCount = completedMatches.filter(m => m.type === MatchType.INTERNAL).length;
    const externalCount = completedMatches.filter(m => m.type === MatchType.EXTERNAL).length;
    
    const matchRelatedExpenses = transactions.filter(t => t.relatedMatchId && t.type === TransactionType.EXPENSE);
    const totalExpense = matchRelatedExpenses.reduce((sum, t) => sum + t.amount, 0);
    const averageExpense = totalMatches > 0 ? totalExpense / totalMatches : 0;

    return { totalMatches, internalCount, externalCount, totalExpense, averageExpense };
  }, [matches, transactions]);

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMatch(null);
    setOpponent('');
    setDescription('');
    setSelectedParticipants([]);
    setHomeScore('0');
    setAwayScore('0');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenEdit = (match: Match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleSubmitMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const resultString = (editingMatch?.status === 'COMPLETED' || editingMatch?.result) ? `${homeScore} - ${awayScore}` : undefined;

    const matchData: Match = {
      id: editingMatch ? editingMatch.id : Date.now().toString(),
      date,
      time,
      location,
      type,
      opponent: type === MatchType.EXTERNAL ? opponent : undefined,
      description,
      status: editingMatch ? editingMatch.status : 'SCHEDULED',
      participantIds: selectedParticipants,
      result: resultString
    };

    if (editingMatch) {
      onUpdateMatch(matchData);
    } else {
      onAddMatch(matchData);
    }
    resetForm();
  };

  const handleCompleteMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match && isAdmin) {
      onUpdateMatch({ ...match, status: 'COMPLETED', result: match.result || '0 - 0' });
      setShowExpenseForm(matchId);
    }
  };

  const handleAddMatchExpenses = (match: Match) => {
    if (!isAdmin) return;
    const fees = [
      { amount: Number(pitchFee), cat: 'Sân bãi', desc: 'Tiền sân' },
      { amount: Number(waterFee), cat: 'Nước uống', desc: 'Nước uống' },
      { amount: Number(otherFee), cat: 'Khác', desc: 'Chi phí khác' }
    ];

    fees.forEach(fee => {
      if (fee.amount > 0) {
        onAddTransaction({
          id: `${Date.now()}-${Math.random()}`,
          date: match.date,
          amount: fee.amount,
          type: TransactionType.EXPENSE,
          category: fee.cat,
          description: `${fee.desc} trận ${match.type === MatchType.INTERNAL ? 'Nội bộ' : 'vs ' + (match.opponent || 'Đội bạn')}`,
          createdBy: 'Admin',
          relatedMatchId: match.id
        });
      }
    });

    setShowExpenseForm(null);
    setPitchFee('500000');
    setWaterFee('50000');
  };

  const getMatchExpenses = (matchId: string) => {
    return transactions.filter(t => t.relatedMatchId === matchId).reduce((sum, t) => sum + t.amount, 0);
  };

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getOutcomeBadge = (result: string) => {
    if (!result || result === 'Chưa cập nhật') return null;
    const scores = result.split('-').map(s => parseInt(s.trim()));
    if (scores.length !== 2 || isNaN(scores[0]) || isNaN(scores[1])) return null;

    if (scores[0] > scores[1]) return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-200">Thắng</span>;
    if (scores[0] < scores[1]) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200">Thua</span>;
    return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Hòa</span>;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-[1000] text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
          <Trophy className="text-slate-900" size={36} />
          Lịch Sử Thi Đấu
        </h2>
        {isAdmin ? (
          <button 
            onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
            className="bg-black hover:bg-slate-800 text-white px-10 py-4 rounded-2xl flex items-center gap-3 shadow-2xl transition-all active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Hủy' : 'Tạo Trận Đấu Mới'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
            <Lock size={14} /> Chế độ chỉ xem
          </div>
        )}
      </div>

      {/* Summary Stats Card */}
      <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
          <BarChart3 size={180} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col border-r border-white/10 last:border-0 pr-4">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">TỔNG SỐ TRẬN</span>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-[1000] leading-none tracking-tighter">{stats.totalMatches}</span>
              <span className="text-slate-500 text-[10px] font-black uppercase mb-1 tracking-widest">TRẬN ĐÃ ĐÁ</span>
            </div>
          </div>
          <div className="flex flex-col border-r border-white/10 last:border-0 pr-4">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">PHÂN LOẠI TRẬN</span>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-4xl font-[1000] text-blue-400 leading-none">{stats.internalCount}</span>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Nội bộ</span>
              </div>
              <span className="text-white/10 text-4xl font-light">/</span>
              <div className="flex flex-col">
                <span className="text-4xl font-[1000] text-orange-400 leading-none">{stats.externalCount}</span>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Giao hữu</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col border-r border-white/10 last:border-0 pr-4">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">QUỸ CHI SÂN</span>
            <span className="text-3xl font-[1000] leading-none">{formatCurrency(stats.totalExpense)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">TRUNG BÌNH / TRẬN</span>
            <span className="text-3xl font-[1000] text-blue-400 leading-none">{formatCurrency(stats.averageExpense)}</span>
          </div>
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 animate-fade-in-down">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-[1000] text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
              <Calendar className="text-red-600" size={32} />
              {editingMatch ? 'CHỈNH SỬA TRẬN ĐẤU' : 'LÊN LỊCH TRẬN MỚI'}
            </h3>
            <button onClick={resetForm} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400"><X size={24}/></button>
          </div>
          
          <form onSubmit={handleSubmitMatch} className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="md:col-span-2 flex p-2 bg-slate-100 rounded-[2rem]">
               <button 
                 type="button"
                 onClick={() => setType(MatchType.INTERNAL)}
                 className={`flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all ${type === MatchType.INTERNAL ? 'bg-white text-black shadow-xl scale-[1.02] z-10' : 'text-slate-400'}`}
               >
                 Đá nội bộ
               </button>
               <button 
                 type="button"
                 onClick={() => setType(MatchType.EXTERNAL)}
                 className={`flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all ${type === MatchType.EXTERNAL ? 'bg-white text-black shadow-xl scale-[1.02] z-10' : 'text-slate-400'}`}
               >
                 Giao hữu đối ngoại
               </button>
             </div>

             <div className="space-y-8">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Ngày thi đấu</label>
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black font-black text-sm" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Giờ bóng lăn</label>
                   <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black font-black text-sm" />
                 </div>
               </div>
               
               <div>
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Sân bóng / Địa điểm</label>
                 <div className="relative">
                   <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                   <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black font-black text-sm" />
                 </div>
               </div>

               {type === MatchType.EXTERNAL && (
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Đội bạn (Đối thủ)</label>
                   <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black font-black text-sm" placeholder="Tên đội đối thủ..." />
                 </div>
               )}

               {/* Score Edit in Form (if completed) */}
               {(editingMatch?.status === 'COMPLETED' || editingMatch?.result) && (
                 <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 text-center">TỶ SỐ TRẬN ĐẤU</label>
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-2">JC UNITED</span>
                        <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)} className="w-20 text-center text-3xl font-[1000] p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black" />
                      </div>
                      <span className="text-2xl font-black text-slate-300">-</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-2">{type === MatchType.INTERNAL ? 'JC TEAM B' : (opponent || 'ĐỐI THỦ').toUpperCase()}</span>
                        <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)} className="w-20 text-center text-3xl font-[1000] p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black" />
                      </div>
                    </div>
                 </div>
               )}

               <div>
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Thông tin / Ghi chú</label>
                 <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-black h-32 font-medium text-sm" placeholder="Chia đội, trang phục..."></textarea>
               </div>
             </div>

             {/* Attendance Selection */}
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col h-[550px]">
                <h4 className="text-[11px] font-[1000] text-slate-700 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-3"><UserCheck size={20} className="text-green-600" /> ĐIỂM DANH CẦU THỦ ({selectedParticipants.length})</span>
                  <button type="button" onClick={() => setSelectedParticipants(members.filter(m => m.status === 'ACTIVE').map(m => m.id))} className="text-[10px] text-blue-600 hover:text-blue-800 uppercase font-[1000] tracking-widest border-b-2 border-blue-100">Chọn tất cả</button>
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {members.filter(m => m.status === 'ACTIVE').map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleParticipant(m.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-[1000] transition-all border-2 ${selectedParticipants.includes(m.id) ? 'bg-white border-slate-900 text-slate-900 shadow-xl scale-[1.02] z-10' : 'border-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[12px] ${selectedParticipants.includes(m.id) ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="uppercase tracking-tight">{m.name}</p>
                          <p className={`text-[9px] font-bold ${selectedParticipants.includes(m.id) ? 'text-green-500' : 'text-slate-400'}`}>{selectedParticipants.includes(m.id) ? 'ĐÃ CÓ MẶT' : 'CHƯA XÁC NHẬN'}</p>
                        </div>
                      </div>
                      {selectedParticipants.includes(m.id) && <CheckCircle2 size={24} className="text-slate-900" />}
                    </button>
                  ))}
                </div>
             </div>

             <div className="md:col-span-2 flex justify-end gap-6 pt-10 border-t border-slate-50">
                <button type="button" onClick={resetForm} className="px-10 py-4 text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] hover:text-slate-600 transition-colors">Hủy thao tác</button>
                <button type="submit" className="px-16 py-4 bg-black text-white font-[1000] rounded-[1.5rem] shadow-2xl hover:bg-slate-800 transition-all text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                  <Save size={18}/> {editingMatch ? 'CẬP NHẬT TRẬN ĐẤU' : 'LƯU LỊCH THI ĐẤU'}
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Match List */}
      <div className="grid grid-cols-1 gap-12">
        {sortedMatches.map(match => {
          const totalCost = getMatchExpenses(match.id);
          const isExpenseFormOpen = showExpenseForm === match.id;
          const participantsCount = match.participantIds?.length || 0;
          
          return (
            <div key={match.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
              <div className="flex flex-col md:flex-row">
                {/* Date & Time Column */}
                <div className={`p-10 md:w-60 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-50 ${match.status === 'COMPLETED' ? 'bg-slate-50/50' : 'bg-blue-50/30'}`}>
                  <span className="text-[11px] font-[1000] text-slate-400 uppercase tracking-[0.4em] mb-4">{new Date(match.date).toLocaleDateString('vi-VN', { weekday: 'long' })}</span>
                  <span className="text-7xl font-[1000] text-slate-900 leading-none tracking-tighter">{new Date(match.date).getDate()}</span>
                  <span className="text-[16px] font-black text-slate-500 uppercase mt-4 tracking-[0.3em]">TH {new Date(match.date).getMonth() + 1}</span>
                  <div className="mt-10 flex items-center gap-3 text-xs font-[1000] px-6 py-3 rounded-2xl bg-white shadow-xl border border-slate-50 text-slate-800">
                    <Clock size={18} className="text-red-500" /> {match.time}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-12 flex flex-col">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className={`text-[10px] font-[1000] uppercase px-5 py-2 rounded-xl border-2 ${match.type === MatchType.INTERNAL ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                          {match.type === MatchType.INTERNAL ? 'Trận Nội Bộ' : 'Giao Hữu'}
                        </span>
                        {match.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-[1000] uppercase px-5 py-2 rounded-xl bg-slate-900 text-white shadow-xl border-2 border-slate-900">KẾT THÚC</span>
                        ) : (
                          <span className="text-[10px] font-[1000] uppercase px-5 py-2 rounded-xl bg-blue-600 text-white animate-pulse border-2 border-blue-600">SẮP DIỄN RA</span>
                        )}
                        {getOutcomeBadge(match.result || '')}
                      </div>
                      <h3 className="text-4xl font-[1000] text-slate-900 tracking-tighter leading-none uppercase">
                        {match.type === MatchType.INTERNAL ? 'JC United: Đối kháng' : `JC United vs ${match.opponent?.toUpperCase() || 'Đội bạn'}`}
                      </h3>
                      <div className="flex items-center gap-6 mt-6">
                        <div className="flex items-center gap-3 text-sm font-black text-slate-400 italic bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
                           <MapPin size={18} className="text-red-500"/> {match.location}
                        </div>
                      </div>
                    </div>
                    
                    {(match.status === 'COMPLETED' || match.result) && (
                      <div className="relative group/score">
                        <div className="bg-slate-900 border-[8px] border-white shadow-2xl text-white px-12 py-7 rounded-[2.5rem] text-6xl font-[1000] tracking-[0.5em] italic flex items-center justify-center min-w-[280px]">
                          {match.result || '0-0'}
                        </div>
                        {isAdmin && (
                          <button 
                            onClick={() => handleOpenEdit(match)}
                            className="absolute -top-4 -right-4 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all opacity-0 group-hover/score:opacity-100 z-10"
                            title="Sửa tỷ số và thông tin"
                          >
                            <Edit3 size={20} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Attendance Section */}
                  <div className="bg-slate-50/50 border-2 border-slate-50 rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none"><Users size={120} /></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <h4 className="text-[11px] font-[1000] text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                        <Users size={20} className="text-slate-300" /> DANH SÁCH RA SÂN ({participantsCount})
                      </h4>
                      {isAdmin && (
                        <button 
                          onClick={() => handleOpenEdit(match)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest border-b-2 border-blue-100 pb-1"
                        >
                          Điều chỉnh danh sách
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 relative z-10">
                      {match.participantIds && match.participantIds.length > 0 ? (
                        match.participantIds.map(pid => {
                          const m = members.find(mem => mem.id === pid);
                          return (
                            <div key={pid} className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-300 transition-all hover:scale-105">
                              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-white">
                                {m?.name.charAt(0)}
                              </div>
                              <span className="text-[13px] font-[1000] text-slate-800 uppercase tracking-tight">{m?.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[12px] text-slate-400 font-black uppercase tracking-widest italic py-4 flex items-center gap-3">
                          <AlertTriangle size={18}/> Chưa có dữ liệu điểm danh trận này
                        </div>
                      )}
                    </div>
                  </div>

                  {match.description && (
                    <div className="mb-10 bg-blue-50/50 px-10 py-6 rounded-[2rem] border-l-[16px] border-blue-100">
                      <p className="text-sm text-slate-600 font-bold italic leading-relaxed">"{match.description}"</p>
                    </div>
                  )}

                  <div className="mt-auto pt-10 border-t border-slate-50 flex flex-wrap items-center gap-12">
                    {match.status === 'SCHEDULED' && isAdmin && (
                      <button 
                        onClick={() => handleCompleteMatch(match.id)}
                        className="flex items-center gap-4 px-12 py-5 bg-black text-white rounded-[1.5rem] text-[12px] font-[1000] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <CheckCircle2 size={24} /> KẾT THÚC & ĐỐI SOÁT QUỸ
                      </button>
                    )}

                    {match.status === 'COMPLETED' && isAdmin && (
                      <button 
                        onClick={() => handleOpenEdit(match)}
                        className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-colors"
                      >
                        <Edit3 size={16}/> Sửa thông tin & Tỷ số
                      </button>
                    )}
                    
                    <div className="flex items-center gap-5 text-xs font-black text-slate-600">
                      <div className="p-4 bg-slate-100 rounded-[1.5rem]"><ReceiptText size={28} className="text-slate-400" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">CHI PHÍ TRẬN ĐẤU</span>
                        <span className={`text-3xl font-[1000] leading-none ${totalCost > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                          {formatCurrency(totalCost)}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button 
                        onClick={() => { if(confirm('Bạn có chắc chắn muốn xóa trận đấu này?')) onDeleteMatch(match.id); }}
                        className="ml-auto p-5 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-[2rem] transition-all"
                        title="Xóa trận đấu"
                      >
                        <Trash2 size={28} />
                      </button>
                    )}
                  </div>

                  {/* Auto Expense Form */}
                  {isExpenseFormOpen && isAdmin && (
                    <div className="mt-12 p-12 bg-slate-900 text-white rounded-[3.5rem] border-4 border-slate-800 animate-fade-in-up shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500"></div>
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xs font-[1000] text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                          <DollarSign size={28} className="text-green-500" /> 
                          KÊ KHAI TÀI CHÍNH TRẬN ĐẤU
                        </h4>
                        <button onClick={() => setShowExpenseForm(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                          <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-[0.2em]">TIỀN THUÊ SÂN</label>
                          <input type="number" step={50000} value={pitchFee} onChange={e => setPitchFee(e.target.value)} className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-[1000] text-white focus:ring-4 focus:ring-green-500/20 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-slate-500 uppercase mb-4 block tracking-[0.2em]">NƯỚC UỐNG & PHỤ PHÍ</label>
                          <input type="number" step={10000} value={waterFee} onChange={e => setWaterFee(e.target.value)} className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-[1000] text-white focus:ring-4 focus:ring-green-500/20 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-8 mt-12">
                        <button onClick={() => setShowExpenseForm(null)} className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all">Để sau</button>
                        <button onClick={() => handleAddMatchExpenses(match)} className="bg-green-600 text-white px-12 py-5 rounded-2xl text-[12px] font-[1000] uppercase tracking-[0.3em] shadow-2xl hover:bg-green-700 transition-all active:scale-95">Xác nhận & Cập nhật quỹ</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="py-48 text-center bg-white rounded-[5rem] border-8 border-dashed border-slate-100 flex flex-col items-center px-12">
             <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-12 border border-slate-100 shadow-inner">
               <Trophy size={80} className="text-slate-200" />
             </div>
             <p className="text-slate-900 font-[1000] text-3xl uppercase tracking-tighter mb-4">CHƯA CÓ LỊCH THI ĐẤU</p>
             <p className="text-slate-400 text-sm uppercase tracking-[0.3em] font-black max-w-md leading-relaxed">Hệ thống đang sẵn sàng. Hãy bắt đầu bằng việc tạo trận đấu đầu tiên cho đội bóng của bạn.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[4rem] flex flex-col md:flex-row gap-10 items-start shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none"><Info size={180} /></div>
        <div className="p-6 bg-slate-800 rounded-[2rem] flex-shrink-0 border border-white/5">
          <Info className="text-blue-400" size={40} />
        </div>
        <div className="space-y-4 flex-1 relative z-10">
          <p className="font-[1000] uppercase tracking-[0.4em] text-blue-400 text-xs">HƯỚNG DẪN QUẢN TRỊ ADMIN:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-400 text-sm font-bold leading-relaxed">
             <p>• <span className="text-white">Chỉnh sửa linh hoạt:</span> Bạn có thể bấm vào biểu tượng bút chì ở tỷ số hoặc tên trận đấu để cập nhật lại bất kỳ thông tin nào, kể cả danh sách cầu thủ sau khi trận đã kết thúc.</p>
             <p>• <span className="text-white">Tỷ số & Kết quả:</span> Tỷ số được nhập theo dạng "Đội nhà - Đội khách". Hệ thống sẽ tự động gán nhãn Thắng/Thua/Hòa dựa trên số bàn thắng.</p>
             <p>• <span className="text-white">Đồng bộ Tài chính:</span> Các khoản chi sân bãi được lưu vết trong Sổ Quỹ. Nếu bạn xóa trận đấu, hãy nhớ kiểm tra lại các lệnh chi tương ứng trong phần Tài chính.</p>
             <p>• <span className="text-white">Điểm danh:</span> Dữ liệu điểm danh tại đây là cơ sở để AI phân tích chuyên cần và gán nhãn cảnh báo "bỏ quá 3 trận" trong báo cáo tháng.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchManager;
