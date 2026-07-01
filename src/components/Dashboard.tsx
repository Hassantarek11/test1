import React, { useMemo } from 'react';
import { Student, GradeLevel, Exam } from '../types';
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  CalendarDays,
  ChevronLeft
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  exams: Exam[];
  onNavigate: (tab: string) => void;
  onSelectStudent: (student: Student) => void;
  selectedMonth: string;
}

export default function Dashboard({ 
  students, 
  exams, 
  onNavigate, 
  onSelectStudent,
  selectedMonth 
}: DashboardProps) {
  
  // Dynamic Month Name in Arabic
  const getArabicMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthsArabic: { [key: string]: string } = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
    };
    return `${monthsArabic[month] || month} ${year}`;
  };

  // Math Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    
    // Grade distribution
    const firstCount = students.filter(s => s.gradeLevel === GradeLevel.FIRST).length;
    const secondCount = students.filter(s => s.gradeLevel === GradeLevel.SECOND).length;
    const thirdCount = students.filter(s => s.gradeLevel === GradeLevel.THIRD).length;

    // Payments for selected month
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    let totalCollected = 0;
    let totalExpected = 0;

    students.forEach(student => {
      const payment = student.payments?.[selectedMonth];
      const required = payment?.totalRequired || 150; // default fee 150
      totalExpected += required;

      if (payment) {
        if (payment.status === 'paid') {
          paidCount++;
          totalCollected += payment.amountPaid;
        } else if (payment.status === 'partial') {
          partialCount++;
          totalCollected += payment.amountPaid;
        } else {
          unpaidCount++;
        }
      } else {
        unpaidCount++;
      }
    });

    // Unpaid/Late students lists
    const lateStudents = students.filter(student => {
      const payment = student.payments?.[selectedMonth];
      return !payment || payment.status === 'unpaid';
    }).slice(0, 5);

    // Calculate attendance rate
    let totalAttendancePossible = 0;
    let totalAttendancePresent = 0;
    students.forEach(student => {
      if (student.attendance) {
        Object.values(student.attendance).forEach(record => {
          totalAttendancePossible++;
          if (record.status === 'present') {
            totalAttendancePresent++;
          }
        });
      }
    });

    const attendanceRate = totalAttendancePossible > 0 
      ? Math.round((totalAttendancePresent / totalAttendancePossible) * 100) 
      : 100;

    // Top students based on exam results
    const studentAverages = students.map(student => {
      let totalScore = 0;
      let totalExams = 0;
      if (student.examResults) {
        Object.entries(student.examResults).forEach(([examId, score]) => {
          const exam = exams.find(e => e.id === examId);
          if (exam) {
            totalScore += (score / exam.maxScore) * 100;
            totalExams++;
          }
        });
      }
      return {
        student,
        avg: totalExams > 0 ? Math.round(totalScore / totalExams) : null
      };
    }).filter(item => item.avg !== null)
      .sort((a, b) => (b.avg || 0) - (a.avg || 0))
      .slice(0, 5);

    return {
      total,
      firstCount,
      secondCount,
      thirdCount,
      paidCount,
      partialCount,
      unpaidCount,
      totalCollected,
      totalExpected,
      attendanceRate,
      lateStudents,
      studentAverages
    };
  }, [students, exams, selectedMonth]);

  const collectionPercentage = metrics.totalExpected > 0 
    ? Math.round((metrics.totalCollected / metrics.totalExpected) * 100) 
    : 0;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome and Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-l from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-sans">لوحة التحكم والمتابعة</h1>
          <p className="text-emerald-100 mt-1 text-sm md:text-base">متابعة الطلاب، الاشتراكات الشهرية، الحضور والغياب، والتحصيل المالي لشهور الثانوية.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 text-sm">
          <CalendarDays className="h-5 w-5 text-emerald-200 animate-pulse" />
          <div>
            <span className="block text-xs text-emerald-200">الشهر المحدد للمتابعة</span>
            <span className="font-semibold text-white">{getArabicMonthName(selectedMonth)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 block">إجمالي الطلاب</span>
            <span className="text-3xl font-bold text-slate-800 font-mono block">{metrics.total}</span>
            <span className="text-xs text-emerald-600 font-medium">طالب مسجل نشط</span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Collected Fees */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 block">المبالغ المحصلة ({getArabicMonthName(selectedMonth).split(' ')[0]})</span>
            <span className="text-3xl font-bold text-emerald-600 font-mono block">{metrics.totalCollected} ج.م</span>
            <span className="text-xs text-slate-400">من إجمالي {metrics.totalExpected} ج.م</span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        {/* Paid Percentage */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 block">نسبة تحصيل الاشتراكات</span>
            <span className="text-3xl font-bold text-teal-600 font-mono block">{collectionPercentage}%</span>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${collectionPercentage}%` }}></div>
            </div>
          </div>
          <div className="bg-teal-50 p-4 rounded-xl text-teal-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500 block">معدل الحضور العام</span>
            <span className="text-3xl font-bold text-amber-600 font-mono block">{metrics.attendanceRate}%</span>
            <span className="text-xs text-slate-400">لجميع المحاضرات والشهور</span>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid: Grade Distribution & Outstanding Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Grid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">توزيع الطلاب على الصفوف</h3>
            <div className="space-y-4">
              {/* First Grade */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{GradeLevel.FIRST}</span>
                  <span className="font-bold text-slate-900">{metrics.firstCount} طالب</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.firstCount / metrics.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Second Grade */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{GradeLevel.SECOND}</span>
                  <span className="font-bold text-slate-900">{metrics.secondCount} طالب</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.secondCount / metrics.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Third Grade */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{GradeLevel.THIRD}</span>
                  <span className="font-bold text-slate-900">{metrics.thirdCount} طالب</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.thirdCount / metrics.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>الفرقة الدراسية الأكثر عدداً</span>
            <span className="font-semibold text-slate-700">
              {metrics.firstCount >= metrics.secondCount && metrics.firstCount >= metrics.thirdCount ? GradeLevel.FIRST : 
               metrics.secondCount >= metrics.firstCount && metrics.secondCount >= metrics.thirdCount ? GradeLevel.SECOND : GradeLevel.THIRD}
            </span>
          </div>
        </div>

        {/* Month Payments Progress chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span>تحليل اشتراكات شهر {getArabicMonthName(selectedMonth).split(' ')[0]}</span>
            <span className="text-xs font-normal text-slate-500">مقسمة حسب حالة الدفع</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Visual breakdown ring/bars */}
            <div className="md:col-span-1 flex flex-col items-center justify-center space-y-2 border-l border-slate-100 pl-4">
              <div className="relative flex items-center justify-center">
                {/* Simulated circle with simple css styling */}
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center flex-col shadow-inner">
                  <span className="text-2xl font-bold font-mono text-emerald-600">{metrics.paidCount + metrics.partialCount}</span>
                  <span className="text-[10px] text-slate-400">مسدد / جزئي</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500 font-medium">من إجمالي {metrics.total} طلاب مستحقين للشهر الحالي</p>
            </div>

            {/* List and percentage progress */}
            <div className="md:col-span-2 space-y-4">
              {/* Full Paid */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    مدفوع بالكامل
                  </span>
                  <span className="font-bold text-slate-800">{metrics.paidCount} طالب ({metrics.total > 0 ? Math.round((metrics.paidCount/metrics.total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.total > 0 ? (metrics.paidCount/metrics.total)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Partial Paid */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    مدفوع جزئياً (متبقي عليه جزء)
                  </span>
                  <span className="font-bold text-slate-800">{metrics.partialCount} طالب ({metrics.total > 0 ? Math.round((metrics.partialCount/metrics.total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${metrics.total > 0 ? (metrics.partialCount/metrics.total)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Unpaid */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    لم يتم الدفع
                  </span>
                  <span className="font-bold text-slate-800">{metrics.unpaidCount} طالب ({metrics.total > 0 ? Math.round((metrics.unpaidCount/metrics.total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${metrics.total > 0 ? (metrics.unpaidCount/metrics.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Top Students and Unpaid Students alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Payment Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
              طلاب لم يسددوا اشتراك الشهر ({getArabicMonthName(selectedMonth).split(' ')[0]})
            </h3>
            <button 
              onClick={() => onNavigate('students')} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              عرض الكل
            </button>
          </div>

          {metrics.lateStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">كل الطلاب سددوا اشتراكات هذا الشهر!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.lateStudents.map(student => (
                <div key={student.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <button 
                      onClick={() => onSelectStudent(student)}
                      className="font-bold text-slate-800 text-sm hover:text-indigo-600 text-right block"
                    >
                      {student.name || ''}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{student.gradeLevel}</span>
                      <span>•</span>
                      <span>{student.school}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={`tel:${student.phone}`} 
                      className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-medium font-mono"
                    >
                      اتصال
                    </a>
                    <span className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
                      غير مسدد
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Students */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              أوائل الطلاب في الاختبارات
            </h3>
            <button 
              onClick={() => onNavigate('exams')} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              عرض الاختبارات
            </button>
          </div>

          {metrics.studentAverages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">لا توجد اختبارات مسجلة بعد لحساب الأوائل.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.studentAverages.map((item, index) => (
                <div key={item.student.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                      index === 0 ? 'bg-amber-100 text-amber-700' : 
                      index === 1 ? 'bg-slate-200 text-slate-700' : 
                      index === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="space-y-0.5">
                      <button 
                        onClick={() => item.student && onSelectStudent(item.student)}
                        className="font-bold text-slate-800 text-sm hover:text-indigo-600 text-right block"
                      >
                        {item.student?.name || ''}
                      </button>
                      <span className="text-xs text-slate-500 block">{item.student.gradeLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-600 font-mono">{item.avg}%</span>
                    <span className="text-xs text-slate-400">متوسط الدرجات</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
