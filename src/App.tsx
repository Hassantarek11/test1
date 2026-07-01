import React, { useState, useEffect, useTransition } from 'react'; // High School Student Management App with Firebase Integration
import { Student, GradeLevel, TrackType, Exam, AttendanceRecord } from './types';
import { 
  fetchStudents, 
  saveStudent, 
  deleteStudent, 
  fetchExams, 
  saveExam, 
  deleteExam, 
  batchUpdateStudents,
  fetchAllAdmins
} from './firebase';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentModal from './components/StudentModal';
import AttendanceManager from './components/AttendanceManager';
import ExamManager from './components/ExamManager';
import StudentProfile from './components/StudentProfile';
import StudentPortal from './components/StudentPortal';
import AdminLogin from './components/AdminLogin';
import AdminSettings from './components/AdminSettings';
import AdminManagement from './components/AdminManagement';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Award, 
  GraduationCap, 
  Menu, 
  X,
  RefreshCw,
  ArrowLeftRight,
  Settings,
  ShieldAlert
} from 'lucide-react';

// Pre-defined seed students to make the experience immediately fully populated and premium
const INITIAL_SEED_STUDENTS: Student[] = [
  {
    id: "student-seed-1",
    name: "أحمد خالد المنشاوي",
    gradeLevel: GradeLevel.FIRST,
    track: TrackType.GENERAL,
    phone: "01023456789",
    parentPhone: "01123456780",
    school: "مدرسة الأورمان الثانوية العسكرية",
    payments: {
      "2026-06": { month: "2026-06", status: "paid", amountPaid: 150, totalRequired: 150 },
      "2026-05": { month: "2026-05", status: "paid", amountPaid: 150, totalRequired: 150 },
    },
    attendance: {
      "2026-06-28": { date: "2026-06-28", status: "present" },
      "2026-06-29": { date: "2026-06-29", status: "present" }
    },
    examResults: {
      "exam-seed-1": 45,
    },
    notes: "طالب متميز جداً وملتزم بحضور الحصص بالموعد، يحتاج دعم إضافي بالمسائل الرياضية المتقدمة.",
    createdAt: new Date().toISOString()
  },
  {
    id: "student-seed-2",
    name: "فاطمة الزهراء الشافعي",
    gradeLevel: GradeLevel.THIRD,
    track: TrackType.SCIENTIFIC_SCIENCE,
    phone: "01234567891",
    parentPhone: "01034567890",
    school: "مدرسة السيدة خديجة الثانوية بنات",
    payments: {
      "2026-06": { month: "2026-06", status: "partial", amountPaid: 100, totalRequired: 180 },
      "2026-05": { month: "2026-05", status: "paid", amountPaid: 180, totalRequired: 180 }
    },
    attendance: {
      "2026-06-28": { date: "2026-06-28", status: "present" },
      "2026-06-29": { date: "2026-06-29", status: "absent", notes: "مريضة ووالدتها أبلغت بالهاتف" }
    },
    examResults: {
      "exam-seed-2": 49
    },
    notes: "من المتفوقات بالسنتر. ممتازة في مادة الأحياء والفيزياء وتحصل دائماً على الدرجات النهائية.",
    createdAt: new Date().toISOString()
  },
  {
    id: "student-seed-3",
    name: "يوسف محمود البدري",
    gradeLevel: GradeLevel.SECOND,
    track: TrackType.LITERARY,
    phone: "01545678901",
    parentPhone: "01245678902",
    school: "مدرسة جمال عبد الناصر الثانوية بنين",
    payments: {
      "2026-06": { month: "2026-06", status: "unpaid", amountPaid: 0, totalRequired: 160 },
      "2026-05": { month: "2026-05", status: "paid", amountPaid: 160, totalRequired: 160 }
    },
    attendance: {
      "2026-06-28": { date: "2026-06-28", status: "present" },
      "2026-06-29": { date: "2026-06-29", status: "present" }
    },
    examResults: {},
    notes: "يحتاج لمتابعة في مادة التاريخ وحل الواجبات بانتظام.",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_SEED_EXAMS: Exam[] = [
  {
    id: "exam-seed-1",
    title: "اختبار الفيزياء شامل الباب الأول",
    date: "2026-06-25",
    maxScore: 50,
    gradeLevel: GradeLevel.FIRST
  },
  {
    id: "exam-seed-2",
    title: "امتحان الأحياء التجريبي للثانوية العامة",
    date: "2026-06-26",
    maxScore: 50,
    gradeLevel: GradeLevel.THIRD
  }
];

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPending, startTransition] = useTransition();

  // Portal and Admin switcher states
  const [viewMode, setViewMode] = useState<'portal' | 'login' | 'admin'>('portal');
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; username: string; role: string; name?: string } | null>(null);

  // Selected monitoring month (defaults to current month, e.g., '2026-06' for June 2026)
  const [selectedMonth, setSelectedMonth] = useState('2026-06');

  // Modal & Drawer control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast / Notification status
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Students and Exams based on current logged in admin
  const filteredStudents = React.useMemo(() => {
    if (!currentAdmin) return students;
    if (currentAdmin.role === 'super') {
      if (selectedAdminFilter === 'all') return students;
      return students.filter(student => student.createdBy === selectedAdminFilter || (!student.createdBy && selectedAdminFilter === 'admin'));
    }
    // Normal admin: only their own students
    return students.filter(student => student.createdBy === currentAdmin.id || student.createdBy === currentAdmin.username || (!student.createdBy && currentAdmin.id === 'admin'));
  }, [students, currentAdmin, selectedAdminFilter]);

  const filteredExams = React.useMemo(() => {
    if (!currentAdmin) return exams;
    if (currentAdmin.role === 'super') {
      if (selectedAdminFilter === 'all') return exams;
      return exams.filter(exam => exam.createdBy === selectedAdminFilter || (!exam.createdBy && selectedAdminFilter === 'admin'));
    }
    // Normal admin: only their own exams
    return exams.filter(exam => exam.createdBy === currentAdmin.id || exam.createdBy === currentAdmin.username || (!exam.createdBy && currentAdmin.id === 'admin'));
  }, [exams, currentAdmin, selectedAdminFilter]);

  // Fetch data on boot
  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedStudents = await fetchStudents() || [];
      const fetchedExams = await fetchExams() || [];
      const fetchedAdmins = await fetchAllAdmins() || [];
      
      setAllAdmins(fetchedAdmins);

      // If database is completely empty, auto-seed it with beautiful records so the system is immediately usable!
      if (fetchedStudents.length === 0 && fetchedExams.length === 0) {
        showToast("بدء تهيئة قواعد البيانات وتنزيل الطلاب التجريبيين...", "info");
        
        // Save seed exams first
        for (const exam of INITIAL_SEED_EXAMS) {
          // Tag seed exams with admin creator
          const seedExam = { ...exam, createdBy: "admin" };
          await saveExam(seedExam);
        }
        
        // Save seed students
        for (const student of INITIAL_SEED_STUDENTS) {
          // Tag seed students with admin creator
          const seedStudent = { ...student, createdBy: "admin" };
          await saveStudent(seedStudent);
        }

        // Apply tags to state
        const seededStudents = INITIAL_SEED_STUDENTS.map(s => ({ ...s, createdBy: "admin" }));
        const seededExams = INITIAL_SEED_EXAMS.map(e => ({ ...e, createdBy: "admin" }));

        setStudents(seededStudents);
        setExams(seededExams);
        showToast("تم إدراج بيانات تجريبية رائعة لتجربة السيستم بنجاح!", "success");
      } else {
        setStudents(fetchedStudents);
        setExams(fetchedExams);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("خطأ أثناء الاتصال بقاعدة البيانات. يرجى إعادة المحاولة.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS ---

  // Add or edit student
  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      const now = new Date().toISOString();
      const payload: Student = editingStudent
        ? { ...editingStudent, ...studentData }
        : {
            id: `student-${Date.now()}`,
            name: studentData.name || "",
            gradeLevel: studentData.gradeLevel || GradeLevel.FIRST,
            track: studentData.track || TrackType.GENERAL,
            phone: studentData.phone || "",
            parentPhone: studentData.parentPhone || "",
            school: studentData.school || "",
            payments: studentData.payments || {},
            attendance: studentData.attendance || {},
            examResults: studentData.examResults || {},
            notes: studentData.notes || "",
            createdAt: now,
            createdBy: currentAdmin?.id || 'admin',
          };

      await saveStudent(payload);
      
      // Update local state
      setStudents(prev => {
        const exists = prev.some(s => s.id === payload.id);
        if (exists) {
          return prev.map(s => s.id === payload.id ? payload : s);
        }
        return [payload, ...prev];
      });

      // Update selectedStudent view if it was active
      if (selectedStudent && selectedStudent.id === payload.id) {
        setSelectedStudent(payload);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      showToast(editingStudent ? "تم تعديل بيانات الطالب بنجاح!" : "تم تسجيل الطالب الجديد بنجاح!");
    } catch (err) {
      showToast("فشل في حفظ بيانات الطالب.", "error");
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(null);
      }
      showToast("تم حذف ملف الطالب من السجلات.");
    } catch (err) {
      showToast("خطأ أثناء حذف الطالب.", "error");
    }
  };

  // Update quick payment state for a selected month
  const handleUpdatePayment = async (
    studentId: string, 
    month: string, 
    status: 'paid' | 'unpaid' | 'partial', 
    amountPaid: number
  ) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const currentPayment = student.payments?.[month] || {
        month,
        status: 'unpaid',
        amountPaid: 0,
        totalRequired: 150,
      };

      const updatedPayment = {
        ...currentPayment,
        status,
        amountPaid,
        paidAt: status !== 'unpaid' ? new Date().toISOString() : undefined,
      };

      const updatedStudent = {
        ...student,
        payments: {
          ...(student.payments || {}),
          [month]: updatedPayment
        }
      };

      await saveStudent(updatedStudent);

      setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
      
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(updatedStudent);
      }

      showToast(`تم تحديث حالة دفع اشتراك شهر ${month.split('-')[1]} بنجاح.`);
    } catch (err) {
      showToast("خطأ أثناء تحديث حالة الدفع.", "error");
    }
  };

  // Save student attendance batch for a selected day
  const handleSaveAttendance = async (attendanceData: { [studentId: string]: AttendanceRecord }, date: string) => {
    try {
      const updatedStudents = students.map(student => {
        const record = attendanceData[student.id];
        if (record) {
          return {
            ...student,
            attendance: {
              ...(student.attendance || {}),
              [date]: record
            }
          };
        }
        return student;
      });

      await batchUpdateStudents(updatedStudents);
      setStudents(updatedStudents);
      showToast(`تم حفظ دفاتر الحضور والغياب لتاريخ اليوم ${date} بنجاح!`);
    } catch (err) {
      showToast("فشل حفظ دفاتر الحضور.", "error");
    }
  };

  // Add a Class Exam
  const handleAddExam = async (examData: Omit<Exam, 'id'>) => {
    try {
      const newExam: Exam = {
        ...examData,
        id: `exam-${Date.now()}`,
        createdBy: currentAdmin?.id || 'admin'
      };
      await saveExam(newExam);
      setExams(prev => [newExam, ...prev]);
      showToast(`تم إنشاء اختبار "${newExam.title}" الجديد بنجاح.`);
    } catch (err) {
      showToast("فشل إنشاء الاختبار.", "error");
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string) => {
    try {
      await deleteExam(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      
      // Remove this exam scores reference from all students
      const updatedStudents = students.map(student => {
        const results = { ...(student.examResults || {}) };
        delete results[examId];
        return {
          ...student,
          examResults: results
        };
      });

      await batchUpdateStudents(updatedStudents);
      setStudents(updatedStudents);
      showToast("تم مسح سجلات الاختبار ودرجات الطلاب المتعلقة به.");
    } catch (err) {
      showToast("فشل حذف الاختبار من السجلات.", "error");
    }
  };

  // Save Scores
  const handleSaveScores = async (examId: string, scores: { [studentId: string]: number }) => {
    try {
      const updatedStudents = students.map(student => {
        if (scores[student.id] !== undefined) {
          return {
            ...student,
            examResults: {
              ...(student.examResults || {}),
              [examId]: scores[student.id]
            }
          };
        }
        return student;
      });

      await batchUpdateStudents(updatedStudents);
      setStudents(updatedStudents);
      showToast("تم تسجيل وتعديل درجات جميع الطلاب في الاختبار بنجاح!");
    } catch (err) {
      showToast("فشل حفظ درجات الطلاب.", "error");
    }
  };

  // Update notes of student
  const handleUpdateNotes = async (studentId: string, notes: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const updatedStudent = { ...student, notes };
      await saveStudent(updatedStudent);

      setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(updatedStudent);
      }
      showToast("تم تحديث الملاحظة بنجاح.");
    } catch (err) {
      showToast("خطأ أثناء تحديث الملاحظات السلوكية.", "error");
    }
  };

  const changeTab = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400" dir="rtl">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-700">خلاص هانت اهي اصبر شوية</p>
        <p className="text-xs mt-1">يرجي الأنتظار </p>
      </div>
    );
  }

  if (viewMode === 'portal') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl shadow-lg border text-sm flex items-center gap-3 animate-slide-up ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
            toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
            'bg-indigo-50 text-indigo-850 border-indigo-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
            }`}></div>
            <span className="font-semibold">{toast.message}</span>
          </div>
        )}

        <StudentPortal 
          students={students} 
          exams={exams} 
          onAdminLoginClick={() => {
            setViewMode('login');
          }}
        />
      </div>
    );
  }

  if (viewMode === 'login') {
    return (
      <AdminLogin 
        onLoginSuccess={(admin) => {
          setCurrentAdmin(admin);
          setViewMode('admin');
          setActiveTab('dashboard');
          showToast(`أهلاً بك يا ${admin.name || admin.username}! تم تسجيل الدخول إلى لوحة التحكم بنجاح.`, "success");
        }}
        onBackToPortal={() => {
          setViewMode('portal');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl shadow-lg border text-sm flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
          'bg-indigo-50 text-indigo-850 border-indigo-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
          }`}></div>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Side Navigation - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-l border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-950">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">سيستم الثانوي</h1>
            <p className="text-[10px] text-emerald-400 font-semibold font-mono">STUDENT MANAGER v1.0</p>
          </div>
        </div>

        {/* Selected Month picker inside sidebar */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 block">شهر المتابعة الحالي</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => changeTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            لوحة التحكم
          </button>

          <button
            onClick={() => changeTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            إدارة الطلاب
          </button>

          <button
            onClick={() => changeTab('attendance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="h-4.5 w-4.5" />
            تسجيل الحضور
          </button>

          <button
            onClick={() => changeTab('exams')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'exams'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="h-4.5 w-4.5" />
            درجات الاختبارات
          </button>

          <button
            onClick={() => changeTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            إعدادات الدخول
          </button>

          {currentAdmin?.role === 'super' && (
            <button
              onClick={() => changeTab('admin_mgmt')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                activeTab === 'admin_mgmt'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              إدارة حسابات الأدمن
            </button>
          )}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setViewMode('portal');
                setCurrentAdmin(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-indigo-950/40 text-indigo-400 hover:text-white border border-indigo-900/35 hover:bg-indigo-900/50 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="h-4.5 w-4.5 text-indigo-400" />
              <span>بوابة الطلاب والقرّاء</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>متصل بـ Firestore</span>
          <button 
            onClick={loadData} 
            title="تحديث البيانات"
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Side Navigation - Mobile drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden flex" dir="rtl">
          <div className="w-64 bg-slate-950 h-full flex flex-col p-6 text-slate-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500 rounded text-slate-950">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h1 className="font-bold text-white text-sm">سيستم الثانوي</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-900 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Month picker inside mobile drawer */}
            <div className="mb-6 space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 block">شهر المتابعة الحالي</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-xs font-mono text-white"
              />
            </div>

            <nav className="flex-1 space-y-1">
              <button
                onClick={() => changeTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                لوحة التحكم
              </button>
              <button
                onClick={() => changeTab('students')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'students' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-900'
                }`}
              >
                <Users className="h-4.5 w-4.5" />
                إدارة الطلاب
              </button>
              <button
                onClick={() => changeTab('attendance')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="h-4.5 w-4.5" />
                تسجيل الحضور
              </button>
              <button
                onClick={() => changeTab('exams')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'exams' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-900'
                }`}
              >
                <Award className="h-4.5 w-4.5" />
                درجات الاختبارات
              </button>

              <button
                onClick={() => changeTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-900'
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                إعدادات الدخول
              </button>

              {currentAdmin?.role === 'super' && (
                <button
                  onClick={() => changeTab('admin_mgmt')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'admin_mgmt' ? 'bg-amber-600 text-white' : 'hover:bg-slate-900'
                  }`}
                >
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  إدارة حسابات الأدمن
                </button>
              )}

              <div className="pt-3 mt-3 border-t border-slate-900">
                <button
                  onClick={() => {
                    setViewMode('portal');
                    setCurrentAdmin(null);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="h-4.5 w-4.5 text-indigo-400" />
                  <span>بوابة الطلاب والقرّاء</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          {/* Hamburger Menu - Mobile only */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Admin selector for Super Admin */}
          {currentAdmin?.role === 'super' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 hidden sm:inline">عرض بيانات المعلم:</span>
              <select
                value={selectedAdminFilter}
                onChange={(e) => setSelectedAdminFilter(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 text-xs font-bold focus:outline-none cursor-pointer transition-all shadow-sm"
              >
                <option value="all">الكل (لوحة تحكم موحدة)</option>
                {allAdmins.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.name || adm.username} ({adm.role === 'super' ? 'سوبر أدمن' : 'مسؤول'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
              مرحباً: <span className="text-indigo-600">{currentAdmin?.name || currentAdmin?.username}</span>
            </div>
          )}

          {/* Quick Stats display & Refresh */}
          <div className="flex items-center gap-3">
            {/* Quick search input */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-full border border-indigo-100">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
              <span>لوحة تحكم المتابعة المتكاملة</span>
            </div>

            <button
              onClick={loadData}
              title="تحديث البيانات من السيرفر"
              className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-slate-700">جاري تحميل بيانات سيستم الطلاب...</p>
              <p className="text-xs mt-1">يرجى الانتظار لحين جلب البيانات من Firestore.</p>
            </div>
          ) : (
            <div className={isPending ? 'opacity-50 transition-opacity' : ''}>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  students={filteredStudents} 
                  exams={filteredExams} 
                  selectedMonth={selectedMonth}
                  onNavigate={changeTab}
                  onSelectStudent={setSelectedStudent}
                />
              )}

              {activeTab === 'students' && (
                <StudentList
                  students={filteredStudents}
                  selectedMonth={selectedMonth}
                  onAddStudent={() => {
                    setEditingStudent(null);
                    setIsModalOpen(true);
                  }}
                  onEditStudent={(student) => {
                    setEditingStudent(student);
                    setIsModalOpen(true);
                  }}
                  onDeleteStudent={handleDeleteStudent}
                  onUpdatePayment={handleUpdatePayment}
                  onSelectStudent={setSelectedStudent}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceManager
                  students={filteredStudents}
                  onSaveAttendance={handleSaveAttendance}
                />
              )}

              {activeTab === 'exams' && (
                <ExamManager
                  exams={filteredExams}
                  students={filteredStudents}
                  onAddExam={handleAddExam}
                  onDeleteExam={handleDeleteExam}
                  onSaveScores={handleSaveScores}
                />
              )}

              {activeTab === 'settings' && (
                <AdminSettings
                  currentAdmin={currentAdmin}
                  onUpdateAdmin={(updatedAdmin) => {
                    setCurrentAdmin(updatedAdmin);
                  }}
                  showToast={showToast}
                />
              )}

              {activeTab === 'admin_mgmt' && currentAdmin?.role === 'super' && (
                <AdminManagement
                  currentAdmin={currentAdmin}
                  showToast={showToast}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals & Detail Drawers */}
      <StudentModal
        isOpen={isModalOpen}
        student={editingStudent}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
      />

      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          exams={exams}
          onClose={() => setSelectedStudent(null)}
          onUpdateNotes={handleUpdateNotes}
          onUpdatePayment={handleUpdatePayment}
        />
      )}
    </div>
  );
}
