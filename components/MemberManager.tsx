import React, { useState } from 'react';
import { Member } from '../types';
import { UserPlus, CheckCircle, XCircle, Phone, Shirt, ToggleLeft, ToggleRight, Trash2, Edit2, Building2, Coins, Users, Lock } from 'lucide-react';

interface MemberManagerProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  isAdmin: boolean;
}

const MemberManager: React.FC<MemberManagerProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [supportLevel, setSupportLevel] = useState('100000');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');

  const resetForm = () => {
    setName('');
    setDepartment('');
    setPosition('');
    setPhone('');
    setSupportLevel('100000');
    setType('INTERNAL');
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (member: Member) => {
    if (!isAdmin) return;
    setName(member.name);
    setDepartment(member.department);
    setPosition(member.position);
    setPhone(member.phoneNumber);
    setSupportLevel(member.supportLevel.toString());
    setType(member.type);
    
    setEditingId(member.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    if (isEditing && editingId) {
       // Update existing
       const memberToUpdate = members.find(m => m.id === editingId);
       if (memberToUpdate) {
         onUpdateMember({
           ...memberToUpdate,
           name,
           department,
           position,
           phoneNumber: phone,
           supportLevel: Number(supportLevel),
           type
         });
       }
    } else {
      // Create new
      const newMember: Member = {
        id: Date.now().toString(),
        name,
        department,
        position: position || 'Thành viên',
        phoneNumber: phone,
        status: 'ACTIVE',
        monthlyFeePaid: false,
        supportLevel: Number(supportLevel),
        type
      };
      onAddMember(newMember);
    }
    resetForm();
  };

  const toggleFeeStatus = (member: Member) => {
    if (!isAdmin) return;
    onUpdateMember({ ...member, monthlyFeePaid: !member.monthlyFeePaid });
  };

  const toggleActiveStatus = (member: Member) => {
    if (!isAdmin) return;
    onUpdateMember({ ...member, status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Cầu thủ JC United</h2>
        {isAdmin ? (
          <button 
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <UserPlus size={20} />
            <span>{showForm && !isEditing ? 'Đóng form' : 'Thêm cầu thủ'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
            <Lock size={14} /> Chế độ chỉ xem
          </div>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in-down">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">{isEditing ? 'Cập nhật thông tin' : 'Thêm thành viên mới'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại thành viên</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border ${type === 'INTERNAL' ? 'bg-red-50 border-red-500 text-red-700 font-medium' : 'border-slate-200'}`}
                  onClick={() => setType('INTERNAL')}
                >
                  Nội bộ
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border ${type === 'EXTERNAL' ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'border-slate-200'}`}
                  onClick={() => setType('EXTERNAL')}
                >
                  Ngoại binh
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban / Đơn vị</label>
              <input 
                type="text" placeholder={type === 'INTERNAL' ? "VD: JCA, Triển khai..." : "VD: Bạn của A"} 
                value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí / Ghi chú</label>
              <input 
                type="text" placeholder="Tiền đạo, Thủ môn..." value={position} onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mức đóng hàng tháng (VNĐ)</label>
              <input 
                type="number" step={50000} value={supportLevel} onChange={e => setSupportLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SĐT (Tùy chọn)</label>
              <input 
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4 border-t pt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
              <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm">
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between transition-all ${member.status === 'INACTIVE' ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-red-200 hover:shadow-md'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${member.status === 'ACTIVE' ? (member.type === 'INTERNAL' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600') : 'bg-slate-400'}`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className={`text-xs px-2 py-0.5 rounded ${member.type === 'INTERNAL' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                        {member.type === 'INTERNAL' ? 'Nhân sự' : 'Ngoại binh'}
                     </span>
                     {member.department && (
                       <span className="flex items-center text-xs text-slate-500 font-medium">
                         <Building2 size={12} className="mr-1"/> {member.department}
                       </span>
                     )}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => startEdit(member)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                      <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDeleteMember(member.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3 mt-2">
               <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-2 px-1">
                 {member.position && <div className="flex items-center gap-1"><Shirt size={14}/> {member.position}</div>}
                 {member.phoneNumber && <div className="flex items-center gap-1"><Phone size={14}/> {member.phoneNumber}</div>}
                 <div className="flex items-center gap-1 col-span-2 text-slate-600"><Coins size={14} className="text-yellow-500"/> Mức đóng: <span className="font-semibold">{formatCurrency(member.supportLevel)}</span></div>
               </div>

               <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Trạng thái</span>
                  <button 
                    onClick={() => toggleActiveStatus(member)} 
                    disabled={!isAdmin}
                    className={`focus:outline-none ${!isAdmin ? 'cursor-default' : ''}`}
                  >
                     {member.status === 'ACTIVE' 
                       ? <span className="flex items-center gap-1 text-xs font-bold text-green-600"><ToggleRight size={22}/> Đang đá</span>
                       : <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><ToggleLeft size={22}/> Nghỉ</span>
                     }
                  </button>
               </div>

               <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Quỹ tháng</span>
                  <button 
                    onClick={() => toggleFeeStatus(member)} 
                    disabled={member.status === 'INACTIVE' || !isAdmin}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      member.monthlyFeePaid 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } ${(member.status === 'INACTIVE' || !isAdmin) ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {member.monthlyFeePaid ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {member.monthlyFeePaid ? 'Đã đóng' : 'Chưa đóng'}
                  </button>
               </div>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            <Users className="mx-auto mb-2 opacity-50" size={48} />
            <p>Chưa có danh sách cầu thủ.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManager;