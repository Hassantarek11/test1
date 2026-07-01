import React, { useState, useMemo } from 'react';
import { Student, Exam, GradeLevel, TrackType, AttendanceRecord, PaymentStatus } from '../types';
import {
  GraduationCap,
  Search,
  Phone,
  CalendarCheck,
  Award,
  CreditCard,
  MessageSquare,
  LayoutDashboard,
  School,
  LogOut,
  ChevronLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  ExternalLink,
  ShieldAlert,
  ArrowLeftRight
} from 'lucide-react';

interface StudentPortalProps {
  students: Student[];
  exams: Exam[];
  onAdminLoginClick: () => void;
}

export default function StudentPortal({ students, exams, onAdminLoginClick }: StudentPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'exams' | 'payments' | 'notes'>('overview');
  const [searchError, setSearchError] = useState('');

  // Define months for high school academic calendar
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

  // Student login search action
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    
    if (!searchQuery.trim()) {
      setSearchError('يرجى كتابة اسمك أو رقم هاتفك للبحث.');
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    
    // Find student where name or phone or parentPhone matches
    const matched = students.filter(student => 
      (student.name || '').toLowerCase().includes(query) ||
      (student.phone || '').includes(query) ||
      (student.parentPhone || '').includes(query)
    );

    if (matched.length === 1) {
      setSelectedStudent(matched[0]);
      setActiveTab('overview');
    } else if (matched.length > 1) {
      // If multiple, show an error but we can let them refine. For now let's show first or prompt.
      setSearchError(`تم العثور على أكثر من طالب (${matched.length}) يرجى كتابة الاسم ثنائياً أو ثلاثياً لتحديد هويتك بدقة.`);
    } else {
      setSearchError('عذراً، لم نجد أي طالب مسجل بهذا الاسم أو الرقم. يرجى مراجعة الإدارة لتسجيل بياناتك.');
    }
  };

  // Compute stats for selected student
  const stats = useMemo(() => {
    if (!selectedStudent) return null;

    // Attendance Rate
    const attendanceRecords = Object.values(selectedStudent.attendance || {}) as AttendanceRecord[];
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r: AttendanceRecord) => r.status === 'present').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Exam Results
    const examResultsList = Object.entries(selectedStudent.examResults || {}).map(([examId, score]) => {
      const exam = exams.find(e => e.id === examId);
      return { exam, score };
    }).filter((item): item is { exam: Exam; score: number } => item.exam !== undefined);

    let totalScorePct = 0;
    examResultsList.forEach(item => {
      totalScorePct += (item.score / (item.exam.maxScore as number)) * 100;
    });
    const examAverage = examResultsList.length > 0 ? Math.round(totalScorePct / examResultsList.length) : null;

    // Payments
    const paymentList = academicMonths.map(month => {
      const statusObj: PaymentStatus = (selectedStudent.payments?.[month] as PaymentStatus) || {
        month,
        status: 'unpaid' as const,
        amountPaid: 0,
        totalRequired: 150
      };
      return statusObj;
    });

    const paidMonthsCount = paymentList.filter(p => p.status === 'paid').length;
    const totalMonths = paymentList.length;

    return {
      attendanceRate,
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      examResultsList,
      examAverage,
      paymentList,
      paidMonthsCount,
      totalMonths
    };
  }, [selectedStudent, exams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between" dir="rtl">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">بوابة متابعة الطلاب الثانوية</h1>
              <p className="text-xs text-indigo-600 font-semibold">تواصل مباشر لمعرفة تقارير الحضور والدرجات والاشتراكات</p>
            </div>
          </div>

          <button
            onClick={onAdminLoginClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4 text-slate-500" />
            <span>لوحة تحكم المسؤول</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {!selectedStudent ? (
          /* Login/Search Screen */
          <div className="max-w-xl mx-auto my-8 sm:my-16">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-xl shadow-slate-150 relative overflow-hidden">


              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">مرحباً بك في نظام المتابعة</h2>
                <p className="text-slate-500 text-sm mt-1.5">
                  أدخل اسم الطالب المسجل أو رقم الهاتف (الطالب أو ولي الأمر) لمشاهدة التقرير الشامل فوراً.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">اسم الطالب أو رقم هاتف المتابعة</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: أحمد خالد المنشاوي أو 0102345..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium text-sm"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  </div>
                </div>

                {searchError && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>عرض تقرير المتابعة الخاص بي</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </form>

            </div>
          </div>
        ) : (
          /* Student Portal Dashboard */
          <div className="space-y-6">
            {/* Student Card with logout option */}
            <div className="bg-gradient-to-l from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
                <GraduationCap className="w-48 h-48" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center font-bold text-2xl border border-white/10">
                    {(selectedStudent.name || '').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black">{selectedStudent.name}</h2>
                      <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold rounded-full border border-indigo-500/20">
                        {selectedStudent.gradeLevel}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1 font-medium">
                      المدرسة: {selectedStudent.school || 'غير محددة'} • الشعبة: {selectedStudent.track}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>خروج من الملف الشخصي</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>نظرة عامة</span>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                <span>سجل الحضور والغياب</span>
              </button>

              <button
                onClick={() => setActiveTab('exams')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                  activeTab === 'exams'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>نتائج ودرجات الاختبارات</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>الاشتراكات والدفع</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>ملاحظات المعلم</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="mt-6">
              {/* 1. Overview Tab */}
              {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">سجل الالتزام</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">{stats.attendanceRate}%</h3>
                      <p className="text-slate-500 text-xs mt-1">نسبة الحضور الإجمالية للمحاضرات</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-600">حضور: {stats.presentDays}</span>
                      <span className="text-rose-500">غياب: {stats.absentDays}</span>
                    </div>
                  </div>

                  {/* Exam Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Award className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">مستوى التحصيل</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">
                        {stats.examAverage !== null ? `${stats.examAverage}%` : 'لا توجد اختبارات'}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">متوسط درجات الطالب بالاختبارات السابقة</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-600">مجموع الاختبارات: {stats.examResultsList.length}</span>
                      <span className="text-slate-500">حالة ممتازة</span>
                    </div>
                  </div>

                  {/* Payment Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">الاشتراكات الشهرية</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">
                        {stats.paidMonthsCount} / {stats.totalMonths}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">الأشهر التي تم سدادها بالكامل للعام الدراسي</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-600">تابع التفاصيل بتبويب الدفع</span>
                      <span className="text-indigo-600 underline cursor-pointer" onClick={() => setActiveTab('payments')}>عرض الكل</span>
                    </div>
                  </div>

                  {/* Highlight Notes Card (Full Width) */}
                  <div className="md:col-span-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-6 flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl flex-shrink-0">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900 mb-1">أحدث ملاحظات وإرشادات المعلم:</h4>
                      <p className="text-indigo-950 text-xs sm:text-sm leading-relaxed font-medium">
                        {selectedStudent.notes ? selectedStudent.notes : "أنت تسير بشكل رائع ومستقر في حضورك وواجباتك. استمر على هذا المنوال بالتوفيق والنجاح!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Attendance Tab */}
              {activeTab === 'attendance' && selectedStudent && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">سجل وتفاصيل دفاتر الغياب والحضور</h3>
                    <div className="flex gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>حاضر ({stats?.presentDays})</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span>غائب ({stats?.absentDays})</span>
                      </span>
                    </div>
                  </div>

                  {Object.keys(selectedStudent.attendance || {}).length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <CalendarCheck className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                      <p className="font-bold">لا يوجد دفاتر حضور مسجلة حتى الآن.</p>
                      <p className="text-xs mt-1">يتم تسجيل الحضور دورياً عند بدء المحاضرات وحضور السنتر.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold">
                            <th className="pb-3">التاريخ</th>
                            <th className="pb-3 text-center">حالة الحضور</th>
                            <th className="pb-3 text-left">ملاحظات الحضور والغياب</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {Object.entries(selectedStudent.attendance || {})
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .map(([date, rawRecord]) => {
                              const record = rawRecord as AttendanceRecord;
                              return (
                                <tr key={date} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 font-mono font-semibold text-slate-700">{date}</td>
                                  <td className="py-3 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                      record.status === 'present'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : record.status === 'absent'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        record.status === 'present' ? 'bg-emerald-500' :
                                        record.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                                      }`}></span>
                                      <span>
                                        {record.status === 'present' ? 'حضور ملتزم' :
                                         record.status === 'absent' ? 'غياب' : 'غياب بعذر مقبول'}
                                      </span>
                                    </span>
                                  </td>
                                  <td className="py-3 text-left text-slate-500 font-medium">{record.notes || '-'}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Exams Tab */}
              {activeTab === 'exams' && selectedStudent && stats && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">نتائج جميع الاختبارات المسجلة</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-100">
                      معدل التحصيل: {stats.examAverage !== null ? `${stats.examAverage}%` : '0%'}
                    </span>
                  </div>

                  {stats.examResultsList.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Award className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                      <p className="font-bold">لا يوجد نتائج اختبارات مسجلة بعد.</p>
                      <p className="text-xs mt-1">بمجرد إجراء اختبارات صفية وتصحيحها سيظهر تقييمك فوراً هنا.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.examResultsList.map((item) => {
                        if (!item.exam) return null;
                        const pct = Math.round((item.score / item.exam.maxScore) * 100);
                        return (
                          <div key={item.exam.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{item.exam.title}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{item.exam.date}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-sm font-black text-slate-800">
                                  {item.score} / {item.exam.maxScore}
                                </span>
                                <span className={`mr-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pct >= 85 ? 'bg-emerald-50 text-emerald-700' :
                                  pct >= 65 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {pct >= 85 ? 'ممتاز' : pct >= 65 ? 'جيد جداً' : 'يحتاج لمراجعة'}
                                </span>
                              </div>
                            </div>

                            {/* Score progress bar */}
                            <div>
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    pct >= 85 ? 'bg-emerald-500' :
                                    pct >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                                <span>النسبة المئوية للاستجابة: {pct}%</span>
                                <span>الدرجة النهائية: {item.exam.maxScore}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Payments Tab */}
              {activeTab === 'payments' && selectedStudent && stats && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">كشف سداد اشتراكات الحصص الشهرية</h3>
                    <span className="text-xs text-slate-500 font-medium">سعر الاشتراك الشهري الأساسي: 150-180 ج.م</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.paymentList.map((payment) => {
                      const isPaid = payment.status === 'paid';
                      const isPartial = payment.status === 'partial';
                      return (
                        <div 
                          key={payment.month} 
                          className={`p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all ${
                            isPaid 
                              ? 'bg-emerald-50/20 border-emerald-150' 
                              : isPartial 
                              ? 'bg-amber-50/20 border-amber-150' 
                              : 'bg-slate-50/50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">{getArabicMonthName(payment.month)}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">رمز الاشتراك: {payment.month}</p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isPaid 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : isPartial 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {isPaid ? 'مدفوع بالكامل' : isPartial ? 'مدفوع جزئياً' : 'لم يسدد'}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">المبلغ المدفوع:</span>
                            <span className={`font-mono font-black ${isPaid ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-rose-500'}`}>
                              {payment.amountPaid} ج.م / {payment.totalRequired} ج.م
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Notes Tab */}
              {activeTab === 'notes' && selectedStudent && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">ملاحظات المعلم السلوكية والدراسية</h3>
                      <p className="text-xs text-slate-400">إرشادات تهدف إلى تحسين الأداء التعليمي باستمرار</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                      {selectedStudent.notes 
                        ? selectedStudent.notes 
                        : "لا يوجد ملاحظات سلبية مسجلة. الطالب يظهر مستوى رائع ومسؤولية كاملة في السنتر. تمنياتنا بالتوفيق والنجاح!"}
                    </p>
                    <div className="pt-4 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>المرشد الأكاديمي والتعليمي</span>
                      <span>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>


    </div>
  );
}
