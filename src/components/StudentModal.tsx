import React, { useState, useEffect } from 'react';
import { Student, GradeLevel, TrackType } from '../types';
import { X, Save, User, Phone, GraduationCap, School, BookOpen, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  student?: Student | null;
}

export default function StudentModal({ isOpen, onClose, onSave, student }: StudentModalProps) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.FIRST);
  const [track, setTrack] = useState<TrackType>(TrackType.GENERAL);
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [school, setSchool] = useState('');
  const [defaultFee, setDefaultFee] = useState(150);
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');

  // Auto-fill form fields when in edit mode
  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setGradeLevel(student.gradeLevel || GradeLevel.FIRST);
      setTrack(student.track || TrackType.GENERAL);
      setPhone(student.phone || '');
      setParentPhone(student.parentPhone || '');
      setSchool(student.school || '');
      // Try to read totalRequired from first payment or default to 150
      const paymentKeys = Object.keys(student.payments || {});
      const firstPaymentRequired = paymentKeys.length > 0 ? student.payments[paymentKeys[0]].totalRequired : 150;
      setDefaultFee(firstPaymentRequired);
      setNotes(student.notes || '');
    } else {
      setName('');
      setGradeLevel(GradeLevel.FIRST);
      setTrack(TrackType.GENERAL);
      setPhone('');
      setParentPhone('');
      setSchool('');
      setDefaultFee(150);
      setNotes('');
    }
    setError('');
  }, [student, isOpen]);

  // Adjust tracks based on Grade level automatically
  useEffect(() => {
    if (gradeLevel === GradeLevel.FIRST) {
      setTrack(TrackType.GENERAL);
    } else if (gradeLevel === GradeLevel.SECOND && track === TrackType.GENERAL) {
      setTrack(TrackType.SCIENTIFIC);
    }
  }, [gradeLevel]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('يرجى إدخال اسم الطالب بالكامل.');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم هاتف الطالب.');
      return;
    }
    if (!parentPhone.trim()) {
      setError('يرجى إدخال رقم هاتف ولي الأمر لمتابعته.');
      return;
    }

    const payload: Partial<Student> = {
      name: name.trim(),
      gradeLevel,
      track,
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      school: school.trim(),
      notes: notes.trim(),
    };

    // If we are creating a new student, initialize payment state
    if (!student) {
      // Setup current month as unpaid with default required fee
      const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
      payload.payments = {
        [currentMonth]: {
          month: currentMonth,
          status: 'unpaid',
          amountPaid: 0,
          totalRequired: defaultFee,
        }
      };
      payload.attendance = {};
      payload.examResults = {};
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{student ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد'}</h3>
              <p className="text-xs text-slate-400">إدخال البيانات الأساسية والمستويات الدراسية بدقة.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-rose-700 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Student Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">اسم الطالب بالكامل *</label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد محمد علي"
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Grade Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">الصف الدراسي *</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
              >
                <option value={GradeLevel.FIRST}>{GradeLevel.FIRST}</option>
                <option value={GradeLevel.SECOND}>{GradeLevel.SECOND}</option>
                <option value={GradeLevel.THIRD}>{GradeLevel.THIRD}</option>
              </select>
            </div>

            {/* Division/Track */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">الشعبة الدراسية</label>
              <select
                value={track}
                disabled={gradeLevel === GradeLevel.FIRST}
                onChange={(e) => setTrack(e.target.value as TrackType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50 text-right"
              >
                {gradeLevel === GradeLevel.FIRST ? (
                  <option value={TrackType.GENERAL}>{TrackType.GENERAL}</option>
                ) : (
                  <>
                    <option value={TrackType.SCIENTIFIC}>{TrackType.SCIENTIFIC}</option>
                    <option value={TrackType.SCIENTIFIC_MATH}>{TrackType.SCIENTIFIC_MATH}</option>
                    <option value={TrackType.SCIENTIFIC_SCIENCE}>{TrackType.SCIENTIFIC_SCIENCE}</option>
                    <option value={TrackType.LITERARY}>{TrackType.LITERARY}</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Student Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">رقم هاتف الطالب *</label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right font-mono"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">رقم ولي الأمر لمتابعته *</label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">المدرسة</label>
            <div className="relative">
              <School className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="اسم المدرسة الثانوية..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
              />
            </div>
          </div>

          {!student && (
            /* Base monthly fee required */
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">قيمة الاشتراك الشهري الثابت (ج.م)</label>
              <div className="relative">
                <BookOpen className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(Number(e.target.value))}
                  className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right font-mono"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 block">ملاحظات إضافية</label>
            <textarea
              rows={2}
              placeholder="مثال: متميز في مادة الفيزياء، يحتاج متابعة إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-right"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-150 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            حفظ البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
