import React, { useState, useEffect } from 'react';
import { saveVerificationCode, checkVerificationCode, updateAdminPassword, fetchActiveVerification } from '../firebase';
import { 
  Shield, 
  KeyRound, 
  User, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Send,
  Lock,
  Smartphone,
  Inbox,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminSettingsProps {
  currentAdmin: { id: string; username: string; role: string; name?: string; password?: string } | null;
  onUpdateAdmin: (admin: any) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface SimulatedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  code: string;
  time: string;
  body: string;
  read: boolean;
}

export default function AdminSettings({ currentAdmin, onUpdateAdmin, showToast }: AdminSettingsProps) {
  const [loading, setLoading] = useState(false);
  
  // Steps: 'request' | 'verify' | 'reset'
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  
  // Inputs
  const [oldPassword, setOldPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Show / hide passwords
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Email Sandbox Simulator State
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);
  const [activeEmail, setActiveEmail] = useState<SimulatedEmail | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sentCodeToUse, setSentCodeToUse] = useState('');
  const [smtpErrorStatus, setSmtpErrorStatus] = useState('');

  // Direct submit password change handler
  const handleSubmitDirectChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentAdmin) {
      setError('خطأ: لم يتم العثور على جلسة مسؤول نشطة.');
      return;
    }

    if (!oldPassword) {
      setError('يرجى إدخال كلمة المرور الحالية أولاً لضمان الأمان.');
      return;
    }

    // Check if the old password matches the current admin password in session
    if (oldPassword !== currentAdmin.password) {
      setError('كلمة المرور الحالية غير صحيحة! يرجى إعادة المحاولة.');
      return;
    }

    if (newPassword.length < 4) {
      setError('يجب أن لا تقل كلمة المرور الجديدة عن 4 أحرف أو أرقام.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة مع حقل التأكيد!');
      return;
    }

    setSavingPassword(true);
    try {
      const success = await updateAdminPassword(currentAdmin.id, newPassword);
      if (success) {
        // Sync new password into current session
        const updated = { ...currentAdmin, password: newPassword };
        onUpdateAdmin(updated);
        
        setSuccessMsg('تم تغيير كلمة المرور بنجاح تام وحفظها في Firestore!');
        showToast('تم تغيير كلمة المرور للمسؤول بنجاح!', 'success');
        
        // Reset state
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('فشل في حفظ كلمة المرور بقاعدة البيانات.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحديث الباسورد على السيرفر.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900">إعدادات الدخول وتغيير كلمة السر</h1>
        <p className="text-slate-500 text-xs">تحديث كلمة مرور حساب المسؤول وتأمين بيانات الدخول الخاصة بك.</p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        
        {/* Password Change Form */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">تغيير كلمة المرور</h3>
                <p className="text-xs text-slate-400">تعديل كلمة المرور الحالية وتعيين كلمة مرور جديدة آمنة.</p>
              </div>
            </div>

            {successMsg ? (
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">عملية ناجحة!</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{successMsg}</p>
                <button
                  onClick={() => { setSuccessMsg(''); setError(''); }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs cursor-pointer"
                >
                  العودة لتعديل آخر
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitDirectChange} className="space-y-5">
                
                {/* Old Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">كلمة المرور الحالية</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showOldPass ? "text" : "password"}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="اكتب الباسورد الحالي للحساب"
                      className="w-full pr-11 pl-12 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="اكتب كلمة مرور قوية جديدة"
                      className="w-full pr-11 pl-12 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة الباسورد الجديد للتأكيد"
                      className="w-full pr-11 pl-12 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/10 transition-all text-xs cursor-pointer"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري تشفير وحفظ الباسورد في Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4.5 w-4.5" />
                      <span>حفظ كلمة السر الجديدة</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
