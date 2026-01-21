import React, { useState } from 'react';
import { Transaction, Member, Match } from '../types';
import { generateFinancialReport } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
  members: Member[];
  matches: Match[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, members, matches }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const result = await generateFinancialReport(transactions, members, matches);
      setReport(result);
    } catch (err) {
      setHasError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <Sparkles className="text-yellow-400" size={24} />
             </div>
             <h2 className="text-3xl font-black tracking-tight">Trợ lý Chiến lược AI</h2>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Hệ thống sử dụng Gemini AI để phân tích dữ liệu dòng tiền và <span className="text-white font-bold underline decoration-red-500 underline-offset-4">chỉ số chuyên cần</span> của từng cầu thủ để đưa ra đề xuất thưởng phạt công bằng nhất.
          </p>
          
          <div className="mt-10">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-white text-slate-900 font-black py-4 px-8 rounded-2xl shadow-xl hover:bg-slate-100 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:animate-pulse" />}
              {loading ? 'Đang soi danh sách cầu thủ...' : 'Tạo báo cáo Phân tích & Đề xuất'}
            </button>
          </div>
        </div>
      </div>

      {hasError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-200 animate-shake">
           <AlertCircle />
           <span className="text-sm font-bold">Lỗi kết nối AI. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau vài giây.</span>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phân tích chiến lược & Tài chính</div>
            <div className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase">Real-time Data Active</div>
          </div>
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-slate-600">
             <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Báo cáo được khởi tạo tự động bởi JC Manager AI Engine</p>
          </div>
        </div>
      )}
      
      {!report && !loading && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <Sparkles size={40} />
          </div>
          <h3 className="text-slate-800 font-black text-lg">Hệ thống đang sẵn sàng</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">Nhấn nút bên trên để AI quét qua sổ quỹ và danh sách điểm danh trận đấu của đội.</p>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;