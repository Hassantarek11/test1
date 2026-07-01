import React, { useState, useMemo } from 'react';
import { Student, GradeLevel, AttendanceRecord } from '../types';
import { 
  Calendar, 
  Check, 
  X, 
  AlertCircle, 
  Users, 
  ChevronLeft, 
  Save, 
  CheckSquare, 
  MinusCircle 
} from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  onSaveAttendance: (attendanceData: { [studentId: string]: AttendanceRecord }, date: string) => void;
}

export default function AttendanceManager({ students, onSaveAttendance }: AttendanceManagerProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(GradeLevel.FIRST);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10)); // 'YYYY-MM-DD'
  
  // Local temporary state to store attendance status during editing
  const [localAttendance, setLocalAttendance] = useState<{ [studentId: string]: AttendanceRecord }>({});
  
  // Filter students based on selected grade
  const gradeStudents = useMemo(() => {
    return students.filter(s => s.gradeLevel === selectedGrade);
  }, [students, selectedGrade]);

  // Load existing attendance record for the selected date when grade or date changes
  React.useEffect(() => {
    const initialLocal: { [studentId: string]: AttendanceRecord } = {};
    gradeStudents.forEach(student => {
      if (student.attendance?.[selectedDate]) {
        initialLocal[student.id] = student.attendance[selectedDate];
      } else {
        // default to present to make logging extremely fast
        initialLocal[student.id] = {
          date: selectedDate,
          status: 'present',
          notes: ''
        };
      }
    });
    setLocalAttendance(initialLocal);
  }, [gradeStudents, selectedDate, selectedGrade]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused') => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        date: selectedDate,
        status,
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      }
    }));
  };

  const markAllAs = (status: 'present' | 'absent') => {
    const updated: { [studentId: string]: AttendanceRecord } = { ...localAttendance };
    gradeStudents.forEach(student => {
      updated[student.id] = {
        date: selectedDate,
        status,
        notes: updated[student.id]?.notes || ''
      };
    });
    setLocalAttendance(updated);
  };

  const handleSubmit = () => {
    onSaveAttendance(localAttendance, selectedDate);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">تسجيل حضور وغياب اليوم</h2>
          <p className="text-slate-400 text-xs mt-1">تحديد الصف، التاريخ وتحضير طلاب السنتر أو المجموعة سريعا.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Grade selection */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value={GradeLevel.FIRST}>{GradeLevel.FIRST}</option>
            <option value={GradeLevel.SECOND}>{GradeLevel.SECOND}</option>
            <option value={GradeLevel.THIRD}>{GradeLevel.THIRD}</option>
          </select>

          {/* Date selection */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono font-medium"
          />
        </div>
      </div>

      {/* Quick master actions & save button */}
      {gradeStudents.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 ml-2">خيارات سريعة للتحضير:</span>
            <button
              onClick={() => markAllAs('present')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              تسجيل حضور الجميع
            </button>
            <button
              onClick={() => markAllAs('absent')}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <MinusCircle className="h-3.5 w-3.5" />
              تسجيل غياب الجميع
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm self-stretch sm:self-auto"
          >
            <Save className="h-4 w-4" />
            حفظ سجل الحضور
          </button>
        </div>
      )}

      {/* Student attendance log list */}
      {gradeStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 text-base">لا يوجد طلاب مسجلين في {selectedGrade} بعد</p>
          <p className="text-xs mt-1">توجّه لقسم الطلاب لتسجيلهم أولاً.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="px-3 py-2 text-right">اسم الطالب</th>
                  <th className="px-3 py-2 text-right">المدرسة / الشعبة</th>
                  <th className="px-3 py-2 text-center">حالة الحضور</th>
                  <th className="px-3 py-2 text-right">ملاحظات الغياب أو عذر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {gradeStudents.map(student => {
                  const record = localAttendance[student.id];
                  const status = record?.status || 'present';
                  const notes = record?.notes || '';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="px-3 py-1">
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{student.phone}</span>
                      </td>

                      {/* School & Track */}
                      <td className="px-3 py-1">
                        <span className="text-xs text-slate-500 block">{student.school}</span>
                        <span className="text-[9px] text-slate-450 bg-slate-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5">{student.track}</span>
                      </td>

                      {/* Attendance status toggler */}
                      <td className="px-3 py-1 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                              status === 'present'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            حاضر
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                              status === 'absent'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <X className="h-3 w-3" />
                            غائب
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'excused')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                              status === 'excused'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <AlertCircle className="h-3 w-3" />
                            بِعُذر
                          </button>
                        </div>
                      </td>

                      {/* Notes input */}
                      <td className="px-3 py-1">
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="ملاحظات (تأخر، لم يحل الواجب...)"
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
                        />
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
