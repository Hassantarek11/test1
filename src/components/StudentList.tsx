import React, { useState, useMemo } from 'react';
import { Student, GradeLevel, TrackType, PaymentStatus } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Phone, 
  GraduationCap, 
  FileCheck, 
  X, 
  Calendar,
  Check,
  AlertCircle,
  Clock,
  User,
  Eye,
  Users
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  selectedMonth: string;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdatePayment: (studentId: string, month: string, status: 'paid' | 'unpaid' | 'partial', amountPaid: number) => void;
  onSelectStudent: (student: Student) => void;
}

export default function StudentList({
  students,
  selectedMonth,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdatePayment,
  onSelectStudent
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  // Month Name in Arabic
  const getArabicMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthsArabic: { [key: string]: string } = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };
    return `${monthsArabic[month] || month} ${year}`;
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.phone || '').includes(searchTerm) ||
        (student.parentPhone || '').includes(searchTerm) ||
        (student.school || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = gradeFilter === 'all' || student.gradeLevel === gradeFilter;
      
      const matchesTrack = trackFilter === 'all' || student.track === trackFilter;

      let matchesPayment = true;
      const payment = student.payments?.[selectedMonth];
      const status = payment ? payment.status : 'unpaid';

      if (paymentFilter !== 'all') {
        matchesPayment = status === paymentFilter;
      }

      return matchesSearch && matchesGrade && matchesTrack && matchesPayment;
    });
  }, [students, searchTerm, gradeFilter, trackFilter, paymentFilter, selectedMonth]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">قائمة الطلاب ({filteredStudents.length})</h2>
          <p className="text-slate-400 text-xs mt-1">البحث وتصفية الطلاب وتحديث حالة الدفع لشهور الثانوية العامة.</p>
        </div>
        <button
          onClick={onAddStudent}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm self-stretch sm:self-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          إضافة طالب جديد
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، هاتف، أو مدرسة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
          />
        </div>

        {/* Grade Filter */}
        <div className="relative">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white appearance-none text-right"
          >
            <option value="all">كل الصفوف الدراسية</option>
            <option value={GradeLevel.FIRST}>{GradeLevel.FIRST}</option>
            <option value={GradeLevel.SECOND}>{GradeLevel.SECOND}</option>
            <option value={GradeLevel.THIRD}>{GradeLevel.THIRD}</option>
          </select>
        </div>

        {/* Track Filter */}
        <div className="relative">
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white appearance-none text-right"
          >
            <option value="all">كل الشعب الدراسية</option>
            <option value={TrackType.GENERAL}>{TrackType.GENERAL}</option>
            <option value={TrackType.SCIENTIFIC}>{TrackType.SCIENTIFIC}</option>
            <option value={TrackType.SCIENTIFIC_MATH}>{TrackType.SCIENTIFIC_MATH}</option>
            <option value={TrackType.SCIENTIFIC_SCIENCE}>{TrackType.SCIENTIFIC_SCIENCE}</option>
            <option value={TrackType.LITERARY}>{TrackType.LITERARY}</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white appearance-none text-right"
          >
            <option value="all">كل حالات الدفع ({getArabicMonthName(selectedMonth).split(' ')[0]})</option>
            <option value="paid">مدفوع بالكامل</option>
            <option value="partial">مدفوع جزئياً</option>
            <option value="unpaid">غير مدفوع</option>
          </select>
        </div>
      </div>

      {/* Students Grid & Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 text-base">لم يتم العثور على طلاب مطابقة للبحث</p>
          <p className="text-xs mt-1">تأكد من ضبط الفلاتر أو اكتب اسماً آخر للبحث عنه.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="px-3 py-2 text-right">اسم الطالب / المدرسة</th>
                  <th className="px-3 py-2 text-right">الصف الدراسي / الشعبة</th>
                  <th className="px-3 py-2 text-right">رقم الهاتف</th>
                  <th className="px-3 py-2 text-right">ولي الأمر</th>
                  <th className="px-3 py-2 text-right">اشتراك شهر {getArabicMonthName(selectedMonth).split(' ')[0]}</th>
                  <th className="px-3 py-2 text-center">خيارات سريعة</th>
                  <th className="px-3 py-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-750">
                {filteredStudents.map((student) => {
                  const payment = student.payments?.[selectedMonth];
                  const paymentStatus = payment ? payment.status : 'unpaid';
                  const amountPaid = payment ? payment.amountPaid : 0;
                  const totalRequired = payment ? payment.totalRequired : 150;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & School */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {(student.name || '').charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-bold text-slate-800 hover:text-indigo-600 hover:underline text-right block text-xs"
                            >
                              {student.name || ''}
                            </button>
                            <span className="text-[10px] text-slate-400 block leading-tight">{student.school || 'مدرسة غير محددة'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Grade & Track */}
                      <td className="px-3 py-1.5">
                        <span className="font-medium text-slate-800 block text-xs">{student.gradeLevel}</span>
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5">{student.track}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-1.5 font-mono text-xs">
                        <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-slate-600 hover:text-indigo-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {student.phone}
                        </a>
                      </td>

                      {/* Parent Phone */}
                      <td className="px-3 py-1.5 font-mono text-xs">
                        <a href={`tel:${student.parentPhone}`} className="flex items-center gap-1 text-slate-600 hover:text-indigo-600">
                          <User className="h-3 w-3 text-slate-400" />
                          {student.parentPhone}
                        </a>
                      </td>

                      {/* Payment Badge */}
                      <td className="px-3 py-1.5">
                        {paymentStatus === 'paid' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                            <Check className="h-3 w-3" />
                            مدفوع ({amountPaid} ج.م)
                          </span>
                        )}
                        {paymentStatus === 'partial' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                            <Clock className="h-3 w-3" />
                            جزئي ({amountPaid}/{totalRequired})
                          </span>
                        )}
                        {paymentStatus === 'unpaid' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                            <AlertCircle className="h-3 w-3" />
                            غير مدفوع ({totalRequired})
                          </span>
                        )}
                      </td>

                      {/* Quick Monthly actions */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          {/* Mark Paid button */}
                          <button
                            onClick={() => onUpdatePayment(student.id, selectedMonth, 'paid', totalRequired)}
                            disabled={paymentStatus === 'paid'}
                            title="تسجيل مدفوع بالكامل"
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                              paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>

                          {/* Mark Partial button */}
                          <button
                            onClick={() => {
                              const inputAmount = prompt(`أدخل المبلغ المدفوع (المطلوب ${totalRequired} ج.م):`, String(amountPaid || Math.round(totalRequired / 2)));
                              if (inputAmount !== null) {
                                const parsed = Number(inputAmount);
                                if (!isNaN(parsed) && parsed >= 0) {
                                  const newStatus = parsed === totalRequired ? 'paid' : parsed === 0 ? 'unpaid' : 'partial';
                                  onUpdatePayment(student.id, selectedMonth, newStatus, parsed);
                                }
                              }
                            }}
                            title="تسجيل مدفوع جزئياً"
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                              paymentStatus === 'partial'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>

                          {/* Mark Unpaid button */}
                          <button
                            onClick={() => onUpdatePayment(student.id, selectedMonth, 'unpaid', 0)}
                            disabled={paymentStatus === 'unpaid'}
                            title="إلغاء الدفع"
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                              paymentStatus === 'unpaid'
                                ? 'bg-rose-100 text-rose-600 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectStudent(student)}
                            title="الملف الشخصي والمتابعة"
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            title="تعديل بيانات الطالب"
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطالب "${student.name || ''}" نهائياً من السيستم؟`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            title="حذف الطالب"
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
