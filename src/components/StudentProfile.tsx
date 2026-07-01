import React, { useState, useMemo } from 'react';
import { Student, Exam, GradeLevel } from '../types';
import { 
  X, 
  User, 
  School, 
  Phone, 
  BookOpen, 
  CalendarDays, 
  Award, 
  Check, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Save, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  exams: Exam[];
  onClose: () => void;
  onUpdateNotes: (studentId: string, notes: string) => void;
  onUpdatePayment: (studentId: string, month: string, status: 'paid' | 'unpaid' | 'partial', amountPaid: number) => void;
}

export default function StudentProfile({ 
  student, 
  exams, 
  onClose, 
  onUpdateNotes,
  onUpdatePayment 
}: StudentProfileProps) {
  const [notesText, setNotesText] = useState(student.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Define months for high school academic calendar (e.g., September 2025 to June 2026)
  const academicMonths = [
    '2025-09', '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
  ];

  const getArabicMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthsArabic: { [key: string]: string } = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };
    return `${monthsArabic[month] || month} ${year}`;
  };

  const handleSaveNotes = () => {
    onUpdateNotes(student.id, notesText);
    setIsEditingNotes(false);
  };

  // Compute test stats
  const testStats = useMemo(() => {
    const results = student.examResults || {};
    const resultsList = Object.entries(results).map(([examId, score]) => {
      const exam = exams.find(e => e.id === examId);
      return { exam, score };
    }).filter(item => item.exam !== undefined);

    let totalScorePct = 0;
    resultsList.forEach(item => {
      if (item.exam) {
        totalScorePct += (item.score / item.exam.maxScore) * 100;
      }
    });

    const averagePct = resultsList.length > 0 ? Math.round(totalScorePct / resultsList.length) : null;

    return {
      resultsList,
      averagePct
    };
  }, [student, exams]);

  // Compute attendance stats
  const attendanceStats = useMemo(() => {
    const records = Object.values(student.attendance || {});
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      total,
      present,
      absent,
      excused,
      rate
    };
  }, [student]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-end p-0 sm:p-4 animate-fade-in" dir="rtl">
      {/* Side-Drawer panel */}
      <div className="bg-white w-full max-w-2xl h-full sm:h-[95vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
              {(student.name || '').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{student.name || ''}</h2>
              <span className="text-xs text-slate-500 font-medium">{student.gradeLevel} • {student.track}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section 1: Basic Info Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <School className="h-4 w-4 text-indigo-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">المدرسة الثانوية</span>
                <span className="text-xs font-semibold text-slate-800">{student.school || 'غير محددة'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <Phone className="h-4 w-4 text-indigo-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">رقم هاتف الطالب</span>
                <a href={`tel:${student.phone}`} className="text-xs font-semibold text-slate-800 hover:underline">{student.phone}</a>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <Phone className="h-4 w-4 text-emerald-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">رقم ولي الأمر لمتابعته</span>
                <a href={`tel:${student.parentPhone}`} className="text-xs font-semibold text-slate-800 hover:underline">{student.parentPhone}</a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">تاريخ التسجيل</span>
                <span className="text-xs font-semibold text-slate-800">{new Date(student.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Attendance statistics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CalendarDays className="h-4.5 w-4.5 text-indigo-600" />
              سجل الحضور والغياب (المحاضرات)
            </h3>
            
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/50">
                <span className="text-emerald-700 font-bold text-xl block font-mono">{attendanceStats.present}</span>
                <span className="text-[10px] text-emerald-600 font-medium">حاضر</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100/50">
                <span className="text-rose-700 font-bold text-xl block font-mono">{attendanceStats.absent}</span>
                <span className="text-[10px] text-rose-600 font-medium">غائب</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/50">
                <span className="text-amber-700 font-bold text-xl block font-mono">{attendanceStats.excused}</span>
                <span className="text-[10px] text-amber-600 font-medium">بعذر</span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100/50">
                <span className="text-indigo-700 font-bold text-xl block font-mono">{attendanceStats.rate}%</span>
                <span className="text-[10px] text-indigo-600 font-medium">نسبة الحضور</span>
              </div>
            </div>
          </div>

          {/* Section 3: Monthly Fees Tracker */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
              سجل الاشتراكات الشهرية لعام الثانوية
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {academicMonths.map(month => {
                const payment = student.payments?.[month];
                const status = payment ? payment.status : 'unpaid';
                const amount = payment ? payment.amountPaid : 0;
                const required = payment ? payment.totalRequired : 150;

                return (
                  <div 
                    key={month}
                    className={`p-2.5 rounded-xl border text-center relative flex flex-col justify-between h-24 ${
                      status === 'paid' ? 'bg-emerald-50/50 border-emerald-200' :
                      status === 'partial' ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-600">{getArabicMonthName(month).split(' ')[0]}</span>
                    
                    {/* Status badge and toggle triggers */}
                    <div className="my-1.5 flex justify-center">
                      {status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : status === 'partial' ? (
                        <Clock className="h-5 w-5 text-amber-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {status === 'unpaid' ? `${required} ج.م` : `${amount}/${required}`}
                      </span>
                      {/* Quick adjust inside profile */}
                      <button
                        type="button"
                        onClick={() => {
                          const action = prompt(`ادخل الحالة أو المبلغ المدفوع: "نعم" للدفع الكامل، "لا" لإلغاء الدفع، أو اكتب المبلغ المدفوع للجزئي:`, status === 'paid' ? 'لا' : String(required));
                          if (action === 'نعم' || action === 'yes' || action === 'paid') {
                            onUpdatePayment(student.id, month, 'paid', required);
                          } else if (action === 'لا' || action === 'no' || action === 'unpaid' || action === '0') {
                            onUpdatePayment(student.id, month, 'unpaid', 0);
                          } else if (action !== null) {
                            const parsed = Number(action);
                            if (!isNaN(parsed)) {
                              const newStatus = parsed === required ? 'paid' : parsed === 0 ? 'unpaid' : 'partial';
                              onUpdatePayment(student.id, month, newStatus, parsed);
                            }
                          }
                        }}
                        className="text-[9px] text-indigo-600 hover:underline font-bold block"
                      >
                        تعديل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Exam Scores & Performance */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              درجات الطالب في الامتحانات
              {testStats.averagePct !== null && (
                <span className="mr-auto text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  متوسط الأداء: {testStats.averagePct}%
                </span>
              )}
            </h3>

            {testStats.resultsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد درجات مسجلة للطالب في أي اختبارات حتى الآن.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {testStats.resultsList.map(item => {
                  if (!item.exam) return null;
                  const pct = Math.round((item.score / item.exam.maxScore) * 100);
                  return (
                    <div key={item.exam.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.exam.title}</span>
                        <span className="text-[10px] text-slate-400">{item.exam.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${
                          pct >= 85 ? 'text-emerald-600' : 
                          pct >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}>{pct}%</span>
                        <span className="font-bold font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-100">
                          {item.score} / {item.exam.maxScore} درجة
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Student Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                الملاحظات والمتابعة السلوكية
              </h3>
              {!isEditingNotes ? (
                <button 
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  تعديل
                </button>
              ) : (
                <button 
                  onClick={handleSaveNotes}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  حفظ الملاحظة
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
                placeholder="أضف أي ملاحظات خاصة بتقدم الطالب أو التزامه..."
              />
            ) : (
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {student.notes || 'لا توجد أي ملاحظات مكتوبة حالياً عن هذا الطالب.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0 text-left">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            إغلاق الملف
          </button>
        </div>
      </div>
    </div>
  );
}
