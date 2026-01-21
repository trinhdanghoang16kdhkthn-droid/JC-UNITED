import { GoogleGenAI } from "@google/genai";
import { Transaction, Member, TransactionType, Match } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFinancialReport = async (transactions: Transaction[], members: Member[], matches: Match[]): Promise<string> => {
  try {
    const ai = getClient();
    
    // Calculate basic stats
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    const unpaidMembers = members.filter(m => !m.monthlyFeePaid && m.status === 'ACTIVE').map(m => m.name);
    
    // Calculate attendance stats for AI
    const completedMatches = matches.filter(m => m.status === 'COMPLETED');
    const attendanceStats = members.filter(m => m.status === 'ACTIVE').map(m => {
      const count = completedMatches.filter(match => match.participantIds?.includes(m.id)).length;
      return { 
        name: m.name, 
        matchesPlayed: count,
        missedCount: completedMatches.length - count,
        warning: (completedMatches.length - count) > 3
      };
    });

    const prompt = `
      Bạn là quản lý tài chính và chiến lược vui tính của đội bóng JC United.
      Dưới đây là dữ liệu hiện tại của đội:
      
      TÀI CHÍNH:
      - Tổng thu: ${totalIncome.toLocaleString('vi-VN')} đ
      - Tổng chi: ${totalExpense.toLocaleString('vi-VN')} đ
      - Quỹ hiện tại: ${balance.toLocaleString('vi-VN')} đ
      - CHƯA đóng quỹ tháng: ${unpaidMembers.join(', ') || "Đã đóng đủ hết, đội rất ngoan"}.

      CHUYÊN CẦN (Số trận đã đá trong tổng số ${completedMatches.length} trận gần đây):
      ${JSON.stringify(attendanceStats, null, 2)}

      LƯU Ý ĐẶC BIỆT: Những người có 'warning: true' là đã vắng QUÁ 3 TRẬN trong tháng này.

      Hãy viết báo cáo ngắn gọn (Markdown), giọng văn hài hước, châm biếm kiểu "bóng đá phủi":
      1. Tình hình túi tiền: Quỹ đang "ấm" hay đang "thở oxy"?
      2. Chuyên gia "bào" sân: Khen ngợi những ông chăm đi đá nhất.
      3. CẢNH BÁO "MẤT TÍCH": Cà khịa cực mạnh những ông có 'warning: true' (vắng quá 3 trận). Yêu cầu giải trình hoặc nộp "phạt chuyên cần".
      4. Nhắc nhở nợ quỹ: Liệt kê danh sách nợ quỹ và nhắc nhở quyết liệt nhưng vui vẻ.
      5. Chốt hạ bằng một câu slogan khích lệ anh em đi đá đông đủ.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, hiện tại tôi không thể kết nối với AI để phân tích dữ liệu chuyên cần. Vui lòng thử lại sau.";
  }
};