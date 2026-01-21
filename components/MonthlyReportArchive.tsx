import React, { useState, useMemo } from 'react';
import { Transaction, Member, Match, MonthlyReport, TransactionType, MemberMonthlyStat } from '../types';
import { Calendar, Download, Trash2, FileText, TrendingUp, TrendingDown, Trophy, Users, CheckCircle2, AlertCircle, Plus, Archive, ShieldAlert, UserX, UserCheck, AlertTriangle, Coins } from 'lucide-react';
import { generateFinancialReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface MonthlyReportArchiveProps {
  transactions: Transaction[];
  members: Member[];
  matches: Match[];
  monthlyReports: MonthlyReport[];
  onSaveReport: (report: MonthlyReport) => void;
  onDeleteReport: (id: string) => void;
  isAdmin: boolean;
}

const MonthlyReportArchive: React.FC<MonthlyReportArchiveProps> = ({
  transactions,
  members,
  matches,
  monthlyReports,
  onSaveReport,
  onDeleteReport,
  isAdmin
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<MonthlyReport | null>(null);

  const currentMonthData = useMemo(() => {
    const monthTrans = transactions.filter(t => t.date.startsWith(selectedMonth));
    const monthMatches = matches.filter(m => m.date.startsWith(selectedMonth) && m.status === 'COMPLETED');
    
    const income = monthTrans.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = monthTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    
    let wins = 0, draws = 0, losses = 0;
    monthMatches.forEach(m => {
      if (!m.result || m.result === 'Chưa cập nhật') return;
      const scores = m.result.split('-').map(s => parseInt(s.trim()));
      if (scores[0] > scores[1]) wins++;
      else if (scores[0] < scores[1]) losses++;
      else draws++;
    });

    const activeMembers = members.filter(m => m.status === 'ACTIVE');
    const memberStats: MemberMonthlyStat[] = activeMembers.map(m => {
      const played = monthMatches.filter(match => match.participantIds?.includes(m.id)).length;
      return {
        memberId: m.id,
        memberName: m.name,
        matchesPlayed: played,
        totalMatchesInMonth: monthMatches.length,
        isPaid: m.monthlyFeePaid,
        missedCount: monthMatches.length - played
      };
    });

    const unpaid = members.filter(m => m.status === 'ACTIVE' && !m.monthlyFeePaid);

    return { income, expense, wins, draws, losses, matchCount: monthMatches.length, unpaid, memberStats };
  }, [selectedMonth, transactions, matches, members]);

  const handleGenerateAndSave = async () => {
    if (!isAdmin) return;
    setGenerating(true);
    try {
      const aiComment = await generateFinancialReport(
        transactions.filter(t => t.date.startsWith(selectedMonth)),
        members,
        matches.filter(m => m.date.startsWith(selectedMonth))
      );

      const newReport: MonthlyReport = {
        id: `report_${selectedMonth}_${Date.now()}`,
        month: selectedMonth,
        totalIncome: currentMonthData.income,
        totalExpense: currentMonthData.expense,
        balance: currentMonthData.income - currentMonthData.expense,
        matchCount: currentMonthData.matchCount,
        winCount: currentMonthData.wins,
        drawCount: currentMonthData.draws,
        lossCount: currentMonthData.losses,
        memberStats: currentMonthData.memberStats,
        unpaidMemberIds: currentMonthData.unpaid.map(m => m.id),
        aiSummary: aiComment,
        createdAt: Date.now()
      };

      onSaveReport(newReport);
      alert(`Đã chốt sổ và lưu báo cáo tháng ${selectedMonth}`);
    } catch (error) {
      console.error(error);
      alert('Có lỗi khi tạo báo cáo AI.');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10"><Archive size={160} /></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-[1000] tracking-tight uppercase flex items-center gap-4">
            <Archive className="text-blue-400" size={36} /> Kho Lưu Trữ Báo Cáo
          </h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-xs">Đối soát chuyên cần & Tài chính định kỳ</p>
          
          {isAdmin && (
            <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10 w-full md:w-auto">
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none font-bold text-xs text-white"
                />
              </div>
              <button 
                onClick={handleGenerateAndSave}
                disabled={generating}
                className="bg-white text-black px-8 py-3.5 rounded-2xl text-[11px] font-[1000] uppercase tracking-[0.2em] hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 shadow-xl active:scale-95 transition-all w-full md:w-auto justify-center"
              >
                {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Plus size={18}/>}
                {generating ? 'Đang tổng hợp...' : 'Chốt sổ tháng hiện tại'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {monthlyReports.length > 0 ? (
          monthlyReports.map(report => (
            <div key={report.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-[1000] text-slate-400 uppercase tracking-widest mb-1">MONTHLY ARCHIVE</p>
                  <h3 className="text-3xl font-[1000] text-slate-900">{report.month.split('-')[1]} <span className="text-slate-300">/</span> {report.month.split('-')[0]}</h3>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); }} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1">
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SỐ DƯ CUỐI KỲ</span>
                      <span className={`text-xl font-black ${report.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(report.balance)}
                      </span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: `${(report.totalIncome / (report.totalIncome + report.totalExpense)) * 100}%` }}></div>
                      <div className="h-full bg-red-500" style={{ width: `${(report.totalExpense / (report.totalIncome + report.totalExpense)) * 100}%` }}></div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><TrendingUp size={10} className="text-green-500"/> Tổng Thu</p>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(report.totalIncome)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1"><TrendingDown size={10} className="text-red-500"/> Tổng Chi</p>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(report.totalExpense)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-3">
                   <div className="flex items-center justify-between text-[11px] font-black uppercase">
                      <span className="text-slate-400 tracking-widest">Thi đấu</span>
                      <span className="text-slate-800">{report.matchCount} TRẬN ({report.winCount}W-{report.drawCount}D-{report.lossCount}L)</span>
                   </div>
                   <div className="flex items-center justify-between text-[11px] font-black uppercase">
                      <span className="text-slate-400 tracking-widest">Nợ quỹ</span>
                      <span className={`px-2 py-0.5 rounded ${report.unpaidMemberIds.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {report.unpaidMemberIds.length} CẦU THỦ
                      </span>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setViewingReport(report)}
                className="w-full p-5 bg-black text-white font-[1000] text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:bg-slate-900"
              >
                CHI TIẾT BÁO CÁO
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-10">
            <Archive className="text-slate-100 mb-8" size={120} />
            <h3 className="text-slate-400 font-[1000] text-2xl uppercase tracking-[0.2em]">Kho dữ liệu trống</h3>
            <p className="text-slate-300 text-sm mt-4 max-w-md uppercase font-bold tracking-widest leading-relaxed">
              Vui lòng chọn tháng và thực hiện "Chốt sổ" để đóng băng dữ liệu tài chính và chuyên cần của đội bóng.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-6xl my-8 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-10 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center font-[1000] text-3xl border border-white/10">
                  {viewingReport.month.split('-')[1]}
                </div>
                <div>
                  <h3 className="text-3xl font-[1000] uppercase tracking-tighter">BÁO CÁO ĐỐI SOÁT THÁNG {viewingReport.month.split('-')[1]} <span className="text-slate-600">/</span> {viewingReport.month.split('-')[0]}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-blue-400 text-[10px] font-[1000] uppercase tracking-[0.2em] italic flex items-center gap-2">
                      <ShieldAlert size={12}/> DATA FROZEN: {new Date(viewingReport.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingReport(null)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95"><Plus size={24} className="rotate-45" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* Top Financial Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'SỐ DƯ CUỐI KỲ', val: formatCurrency(viewingReport.balance), color: viewingReport.balance >= 0 ? 'text-blue-600' : 'text-red-600', icon: Coins, bg: 'bg-blue-50/50' },
                  { label: 'TỔNG THU THỰC', val: formatCurrency(viewingReport.totalIncome), color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50/50' },
                  { label: 'TỔNG CHI THỰC', val: formatCurrency(viewingReport.totalExpense), color: 'text-red-600', icon: TrendingDown, bg: 'bg-red-50/50' },
                  { label: 'HIỆU SUẤT THẮNG', val: viewingReport.matchCount > 0 ? `${Math.round((viewingReport.winCount / viewingReport.matchCount) * 100)}%` : '0%', color: 'text-slate-900', icon: Trophy, bg: 'bg-slate-50' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-8 rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm`}>
                    <stat.icon size={24} className="text-slate-400 mb-6" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className={`text-2xl font-[1000] ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* AI Summary Section */}
              {viewingReport.aiSummary && (
                <div className="bg-slate-900 text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl border-l-[16px] border-blue-600">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none"><FileText size={200} /></div>
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                    <ShieldAlert size={18}/> NHẬN ĐỊNH TỪ BAN CÁN SỰ (AI SYSTEM)
                  </h4>
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed font-medium">
                    <ReactMarkdown>{viewingReport.aiSummary}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Attendance & Payment Detail Table */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-[1000] text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                    <Users size={20} className="text-slate-400" /> BẢNG TỔNG KẾT CHUYÊN CẦN & QUỸ
                  </h4>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
                      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div> Cảnh báo vắng &gt;3 trận
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-[1000] uppercase text-[11px] tracking-widest">
                      <tr>
                        <th className="px-8 py-6">Họ và Tên</th>
                        <th className="px-8 py-6 text-center">Tỷ lệ tham gia</th>
                        <th className="px-8 py-6 text-center">Vắng mặt</th>
                        <th className="px-8 py-6 text-center">Đóng quỹ</th>
                        <th className="px-8 py-6">Ghi chú kỷ luật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viewingReport.memberStats.sort((a,b) => b.matchesPlayed - a.matchesPlayed).map((stat) => {
                        const participationRate = stat.totalMatchesInMonth > 0 ? Math.round((stat.matchesPlayed / stat.totalMatchesInMonth) * 100) : 0;
                        return (
                          <tr key={stat.memberId} className={`hover:bg-slate-50 transition-all ${stat.missedCount > 3 ? 'bg-red-50/20' : ''}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[12px] text-white ${stat.missedCount > 3 ? 'bg-red-600' : 'bg-slate-900'}`}>
                                  {stat.memberName.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{stat.memberName}</span>
                                  {stat.missedCount > 3 && <p className="text-[9px] text-red-600 font-black uppercase mt-0.5 tracking-tighter">Báo động vắng trận</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-full max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${participationRate > 70 ? 'bg-blue-500' : participationRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${participationRate}%` }}></div>
                                </div>
                                <span className="font-black text-slate-900">{participationRate}% ({stat.matchesPlayed} trận)</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${stat.missedCount > 3 ? 'text-red-600 underline decoration-2' : 'text-slate-400'}`}>{stat.missedCount} TRẬN</span>
                                {stat.missedCount > 3 && (
                                  <AlertTriangle size={14} className="text-red-500 mt-1 animate-bounce" />
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              {stat.isPaid ? (
                                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 font-[1000] uppercase text-[10px]">
                                  <UserCheck size={14} /> ĐÃ ĐÓNG
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl border border-red-200 font-[1000] uppercase text-[10px] animate-pulse">
                                  <UserX size={14} /> NHẮC NỢ
                                </div>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              {stat.missedCount > 3 ? (
                                <div className="text-red-700 font-black italic text-[11px] bg-red-50 p-3 rounded-xl border border-red-100">
                                  Lý do vắng quá nhiều? Cần họp đội giải trình hoặc đóng phí "vắng mặt" tăng cường.
                                </div>
                              ) : stat.matchesPlayed === stat.totalMatchesInMonth && stat.totalMatchesInMonth > 0 ? (
                                <div className="text-blue-700 font-black italic text-[11px] bg-blue-50 p-3 rounded-xl border border-blue-100">
                                  Chiến binh nòng cốt! Tuyên dương chuyên cần 100%.
                                </div>
                              ) : (
                                <span className="text-slate-300 italic text-[11px]">Duy trì ổn định</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Unpaid Reminder Block */}
              {viewingReport.unpaidMemberIds.length > 0 && (
                <div className="bg-red-50 border-4 border-red-100 rounded-[3rem] p-12 space-y-8 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><AlertCircle size={150} className="text-red-600" /></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <h4 className="text-lg font-[1000] text-red-800 uppercase tracking-widest flex items-center gap-4">
                        <UserX size={28} className="text-red-600" /> DANH SÁCH NHẮC NỢ QUỸ THÁNG
                      </h4>
                      <p className="text-red-400 text-xs font-black uppercase mt-2 tracking-widest">Yêu cầu các thành viên sau khẩn trương nộp quỹ</p>
                    </div>
                    <button 
                      onClick={() => {
                        const names = viewingReport.unpaidMemberIds.map(id => members.find(m => m.id === id)?.name || 'Cầu thủ').join(', ');
                        navigator.clipboard.writeText(`Dòng thông báo nhắc nợ quỹ tháng ${viewingReport.month}: ${names}. Đề nghị anh em nộp quỹ đúng hạn!`);
                        alert('Đã copy danh sách nhắc nợ!');
                      }}
                      className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
                    >
                      COPY DANH SÁCH NHẮC NỢ
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4 relative z-10">
                    {viewingReport.unpaidMemberIds.map(id => {
                      const m = members.find(x => x.id === id);
                      return (
                        <div key={id} className="bg-white text-red-600 px-6 py-3 rounded-2xl border-2 border-red-200 text-xs font-[1000] uppercase tracking-widest shadow-md">
                          {m?.name || 'Thành viên cũ'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => setViewingReport(null)} 
                className="px-16 py-5 bg-black text-white font-[1000] text-xs uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
              >
                ĐÓNG BÁO CÁO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportArchive;