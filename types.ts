export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  createdBy: string;
  relatedMemberId?: string; 
  relatedMemberName?: string;
  relatedMatchId?: string; 
}

export interface Member {
  id: string;
  name: string;
  position: string; 
  department: string; 
  supportLevel: number; 
  phoneNumber: string;
  status: 'ACTIVE' | 'INACTIVE'; 
  type: 'INTERNAL' | 'EXTERNAL'; 
  monthlyFeePaid: boolean;
  notes?: string;
}

export enum MatchType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export interface Match {
  id: string;
  date: string;
  time: string;
  opponent?: string;
  location: string;
  type: MatchType;
  result?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  participantIds?: string[]; 
}

export interface MemberMonthlyStat {
  memberId: string;
  memberName: string;
  matchesPlayed: number;
  totalMatchesInMonth: number;
  isPaid: boolean;
  missedCount: number;
}

export interface MonthlyReport {
  id: string;
  month: string; // Format "YYYY-MM"
  totalIncome: number;
  totalExpense: number;
  balance: number;
  matchCount: number;
  winCount: number;
  drawCount: number;
  lossCount: number;
  memberStats: MemberMonthlyStat[];
  unpaidMemberIds: string[];
  aiSummary?: string;
  createdAt: number;
}

export interface User {
  name: string;
  email: string;
  photo?: string;
  isAdmin: boolean;
}

export interface AccessRecord {
  id: string;
  name: string;
  email: string;
  timestamp: number;
  role: 'ADMIN' | 'GUEST';
}

export interface AppState {
  transactions: Transaction[];
  members: Member[];
  matches: Match[];
  monthlyReports: MonthlyReport[];
  adminEmails: string[];
  accessHistory: AccessRecord[];
  systemPassword?: string;
}

export type View = 'DASHBOARD' | 'FINANCE' | 'MEMBERS' | 'AI_INSIGHTS' | 'MATCHES' | 'SETTINGS' | 'ARCHIVE';