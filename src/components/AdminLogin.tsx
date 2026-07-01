import React, { useState, useEffect } from 'react';
import { fetchAllAdmins } from '../firebase';
import { 
  GraduationCap, 
  User, 
  Lock, 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLoginSuccess: (admin: any) => void;
  onBackToPortal: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToPortal }: AdminLoginProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load all the admins directly from Firestore database
  useEffect(() => {
    async function loadAdmins() {
      try {
        const dbAdmins = await fetchAllAdmins();
        if (dbAdmins && dbAdmins.length > 0) {
          setAdminsList(dbAdmins);
        } else {
          setError("تنبيه: لم يتم العثور على أي حساب مسؤول في قاعدة البيانات 'admins'. يرجى إضافة حساب.");
        }
      } catch (err) {
        console.error("Error fetching admins from Firestore:", err);
        setError("فشل الاتصال بقاعدة البيانات لجلب بيانات الدخول آمنًا.");
      } finally {
        setLoading(false);
      }
    }
    loadAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminsList.length === 0) {
      setError("لا تتوفر بيانات المسؤولين من قاعدة البيانات حالياً. يرجى التأكد من تهيئة قاعدة البيانات.");
      return;
    }

    setSubmitting(true);

    // Simulate a tiny, elegant loading transition for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find matching admin in the list
    const matchedAdmin = adminsList.find(
      (admin) => 
        admin.username && admin.username.trim() === usernameInput.trim() && 
        admin.password && admin.password === passwordInput
    );

    if (matchedAdmin) {
      onLoginSuccess(matchedAdmin);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التحقق وإعادة المحاولة.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-6 relative overflow-hidden" dir="rtl">
      {/* Decorative ambient background lights */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header back button */}
      <div className="w-full max-w-lg mx-auto flex justify-start z-10">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/30 hover:border-slate-700/60 rounded-2xl transition-all cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>الرجوع لبوابة الطلاب</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full flex-1 flex items-center justify-center py-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl relative"
        >
          {/* Top Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/20">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">تسجيل دخول المسؤول</h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              يرجى إدخال اسم المستخدم وكلمة المرور المخزنة بقاعدة البيانات للدخول إلى لوحة إدارة المعلم.
            </p>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-xs font-bold">جاري جلب بيانات الدخول الآمنة من Firestore...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">اسم المستخدم</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    placeholder="مثال: admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-slate-800/50 border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">كلمة المرور</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={submitting}
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-slate-800/50 border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>متستعجلش اصبر بقا </span>
                  </>
                ) : (
                  <span>دخول لوحة التحكم</span>
                )}
              </button>

              {/* Quick Password Hint Box */}
              <div className="mt-6 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-300 font-medium leading-normal">
                 شكراً لك يا معلم ل استخدامك بوابة المتابعه
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-slate-500 text-[10px] font-bold z-10">
        جميع الحقوق محفوظة © {new Date().getFullYear()} • سيستم إدارة ومتابعة الطلاب
      </div>
    </div>
  );
}
