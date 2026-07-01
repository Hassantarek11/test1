import React, { useState, useMemo } from 'react';
import { Student, GradeLevel, Exam } from '../types';
import { 
  Calendar, 
  Award, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  UserCheck, 
  ChevronLeft, 
  FileSpreadsheet, 
  BarChart,
  AlertCircle 
} from 'lucide-react';

interface ExamManagerProps {
  exams: Exam[];
  students: Student[];
  onAddExam: (examData: Omit<Exam, 'id'>) => void;
  onDeleteExam: (examId: string) => void;
  onSaveScores: (examId: string, scores: { [studentId: string]: number }) => void;
}

export default function ExamManager({ 
  exams, 
  students, 
  onAddExam, 
  onDeleteExam, 
  onSaveScores 
}: ExamManagerProps) {
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  
  // New exam form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [maxScore, setMaxScore] = useState(50);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.FIRST);

  // Score registering state
  const [localScores, setLocalScores] = useState<{ [studentId: string]: number }>({});

  const activeExam = useMemo(() => {
    return exams.find(e => e.id === activeExamId) || null;
  }, [exams, activeExamId]);

  // Load students belonging to the active exam grade level
  const examStudents = useMemo(() => {
    if (!activeExam) return [];
    return students.filter(s => s.gradeLevel === activeExam.gradeLevel);
  }, [students, activeExam]);

  // Load existing student scores when active exam changes
  React.useEffect(() => {
    if (activeExam) {
      const initialScores: { [studentId: string]: number } = {};
      examStudents.forEach(student => {
        initialScores[student.id] = student.examResults?.[activeExam.id] !== undefined
          ? student.examResults[activeExam.id]
          : 0;
      });
      setLocalScores(initialScores);
    }
  }, [activeExam, examStudents]);

  // Set first exam as active by default if none selected
  React.useEffect(() => {
    if (exams.length > 0 && !activeExamId) {
      setActiveExamId(exams[0].id);
    }
  }, [exams, activeExamId]);

  const handleScoreChange = (studentId: string, value: string) => {
    const score = value === '' ? 0 : Number(value);
    if (!isNaN(score) && activeExam && score <= activeExam.maxScore && score >= 0) {
      setLocalScores(prev => ({
        ...prev,
        [studentId]: score
      }));
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddExam({
      title: title.trim(),
      date,
      maxScore,
      gradeLevel
    });

    setTitle('');
    setShowAddForm(false);
  };

  const handleSaveAllScores = () => {
    if (activeExamId) {
      onSaveScores(activeExamId, localScores);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      {/* Sidebar: Exam List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col h-[70vh]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            جدول الاختبارات ({exams.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
            title="إضافة اختبار جديد"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Add Exam Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleCreateExam} className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 space-y-3 flex-shrink-0 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">عنوان الاختبار</label>
              <input
                type="text"
                required
                placeholder="مثال: الباب الأول، شامل شهر أكتوبر..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">الصف الدراسي</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-right"
                >
                  <option value={GradeLevel.FIRST}>{GradeLevel.FIRST}</option>
                  <option value={GradeLevel.SECOND}>{GradeLevel.SECOND}</option>
                  <option value={GradeLevel.THIRD}>{GradeLevel.THIRD}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">الدرجة النهائية</label>
                <input
                  type="number"
                  min="1"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-mono text-right"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-mono text-right"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-semibold"
              >
                حفظ الاختبار
              </button>
            </div>
          </form>
        )}

        {/* Exams List Scroller */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BarChart className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-medium">لم يتم إنشاء أي اختبارات بعد.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div
                key={exam.id}
                onClick={() => setActiveExamId(exam.id)}
                className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all ${
                  activeExamId === exam.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-bold text-slate-800 text-sm block leading-tight">{exam.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`هل أنت متأكد من حذف اختبار "${exam.title}" والنتائج المتعلقة به؟`)) {
                        onDeleteExam(exam.id);
                        if (activeExamId === exam.id) {
                          setActiveExamId(null);
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{exam.gradeLevel}</span>
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100 font-bold text-indigo-600">
                    النهائية: {exam.maxScore} م
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Student Score Register Sheet */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col h-[70vh]">
        {!activeExam ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
            <FileSpreadsheet className="h-12 w-12 text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">يرجى اختيار اختبار أو إنشاء واحد جديد</p>
            <p className="text-xs mt-1">تتيح هذه الصفحة تسجيل وتعديل درجات الطلاب لاختبارات الشهر بسهولة.</p>
          </div>
        ) : (
          <>
            {/* Exam Details Summary Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-150 pb-5 mb-4 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{activeExam.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>الصف: {activeExam.gradeLevel}</span>
                  <span>•</span>
                  <span>الدرجة القصوى: {activeExam.maxScore} درجة</span>
                  <span>•</span>
                  <span>التاريخ: {activeExam.date}</span>
                </div>
              </div>

              {examStudents.length > 0 && (
                <button
                  onClick={handleSaveAllScores}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm self-stretch sm:self-auto justify-center"
                >
                  <Save className="h-4 w-4" />
                  حفظ درجات الطلاب
                </button>
              )}
            </div>

            {/* Students Scores Sheet Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {examStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">لا يوجد طلاب في {activeExam.gradeLevel} لإدخال درجاتهم</p>
                  <p className="text-xs mt-1">تأكد من تعديل مستوى الطلاب أو إضافة طلاب جدد.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 pr-1">
                  {examStudents.map(student => {
                    const score = localScores[student.id] || 0;
                    const pct = activeExam.maxScore > 0 ? Math.round((score / activeExam.maxScore) * 100) : 0;
                    
                    return (
                      <div key={student.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                          <span className="text-xs text-slate-400">{student.school || 'مدرسة غير محددة'}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Percentage score visual */}
                          <div className="hidden sm:flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              pct >= 85 ? 'text-emerald-600' : 
                              pct >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>{pct}%</span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${
                                pct >= 85 ? 'bg-emerald-500' : 
                                pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>

                          {/* Score input */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={activeExam.maxScore}
                              value={localScores[student.id] === undefined ? '' : localScores[student.id]}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                            />
                            <span className="text-xs text-slate-400">/ {activeExam.maxScore}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
