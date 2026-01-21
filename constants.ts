import { Member, Transaction, TransactionType } from "./types";

export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Trịnh Đăng Hoàng', department: 'JCA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '2', name: 'Phạm Sơn', department: 'JCL', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '3', name: 'Lương Văn Thành', department: 'JCA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '4', name: 'Trần Văn Dương', department: 'Triển khai', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '5', name: 'Đào Đức Thắng', department: 'PTDA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '6', name: 'Vũ Xuân Chính', department: 'Triển khai', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '7', name: 'Trần Trọng Đông', department: 'JCA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '8', name: 'Đặng Quang Việt', department: 'JCA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '9', name: 'Phạm Văn Trung', department: 'JCP2', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '10', name: 'Nguyễn Quốc Dũng', department: 'JCA', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '11', name: 'Trần Đình Hoàng', department: 'JCP3', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '12', name: 'Phan Minh Đức', department: 'Triển khai', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '13', name: 'Nguyễn Xuân Hoàng', department: 'JCV', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '14', name: 'Trần Mạnh Huy', department: 'Triển khai', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
  { id: '15', name: 'Bùi Đức Đô', department: 'JCV', supportLevel: 100000, position: 'Thành viên', phoneNumber: '', status: 'ACTIVE', type: 'INTERNAL', monthlyFeePaid: false },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const CATEGORIES_EXPENSE = [
  'Sân bãi',
  'Nước uống',
  'Trang phục',
  'Liên hoan',
  'Thưởng thành viên',
  'Dụng cụ',
  'Khác'
];

export const CATEGORIES_INCOME = [
  'Đóng quỹ tháng',
  'Phạt đi trễ',
  'Phạt bỏ trận',
  'Phạt ít đá',
  'Thưởng thành viên',
  'Tài trợ',
  'Khác'
];