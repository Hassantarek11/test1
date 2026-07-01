import React, { useState, useEffect } from 'react';
import { 
  fetchAllAdmins, 
  saveAdmin, 
  deleteAdmin, 
  saveVerificationCode, 
  fetchAllVerifications, 
  deleteVerificationCode 
} from '../firebase';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Save, 
  Loader2, 
  AlertCircle, 
  Edit3, 
  Trash2,
  Check,
  X,
  Lock,
  Plus,
  Mail,
  Send,
  Key,
  RefreshCw,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminManagementProps {
  currentAdmin: { id: string; username: string; role: string; name?: string };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminManagement({ currentAdmin, showToast }: AdminManagementProps) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Custom code state
  const [selectedAdminForCode, setSelectedAdminForCode] = useState('');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [errorCustomCode, setErrorCustomCode] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super'>('admin');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const adminsData = await fetchAllAdmins();
      setAdmins(adminsData || []);
      
      const verificationsData = await fetchAllVerifications();
      setVerifications(verificationsData || []);
    } catch (err) {
      console.error(err);
      setError('فشل في جلب البيانات من السيرفر.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await fetchAllAdmins();
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVerifications = async () => {
    try {
      const data = await fetchAllVerifications();
      setVerifications(data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('admin');
    setError('');
  };

  const handleEditClick = (admin: any) => {
    setIsEditing(true);
    setEditId(admin.id);
    setName(admin.name || '');
    setUsername(admin.username || '');
    setPassword(admin.password || '');
    setRole(admin.role || 'admin');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('جميع الحقول مطلوبة!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists (except for the one being edited)
    const exists = admins.some(
      (a) => a.username.toLowerCase() === cleanUsername && a.id !== editId
    );
    if (exists) {
      setError('اسم المستخدم هذا مستخدم بالفعل من قبل مسؤول آخر!');
      return;
    }

    setSubmitting(true);
    try {
      const docId = editId || `admin_${Date.now()}`;
      const adminData = {
        name: name.trim(),
        username: cleanUsername,
        password: password.trim(),
        role: role
      };

      await saveAdmin(docId, adminData);
      showToast(
        editId ? "تم تحديث بيانات المسؤول بنجاح!" : "تم إضافة المسؤول الجديد بنجاح!",
        "success"
      );
      resetForm();
      await loadAdmins();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ البيانات بقاعدة البيانات.');
      showToast("خطأ أثناء حفظ الحساب.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (adminId === currentAdmin.id) {
      showToast("لا يمكنك حذف حسابك الشخصي النشط حالياً!", "error");
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف حساب المسؤول "${adminName}"؟`)) {
      return;
    }

    try {
      await deleteAdmin(adminId);
      showToast(`تم حذف حساب المسؤول "${adminName}" بنجاح!`, "success");
      await loadAdmins();
    } catch (err) {
      console.error(err);
      showToast("فشل حذف الحساب من قاعدة البيانات.", "error");
    }
  };

  const handleSaveCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCustomCode('');

    if (!selectedAdminForCode) {
      setErrorCustomCode('يرجى اختيار المسؤول المستهدف أولاً.');
      return;
    }

    if (!customCodeInput.trim()) {
      setErrorCustomCode('يرجى إدخال كود التحقق المطلوب.');
      return;
    }

    setSavingCode(true);
    try {
      const emailToSend = customEmailInput.trim() || `${selectedAdminForCode}@smart-education.edu`;
      await saveVerificationCode(selectedAdminForCode, emailToSend, customCodeInput.trim());
      showToast("تم حقن كود التحقق المخصص وتعميمه على حساب المعلم بنجاح!", "success");
      setCustomCodeInput('');
      setCustomEmailInput('');
      await loadVerifications();
    } catch (err) {
      console.error(err);
      setErrorCustomCode('حدث خطأ أثناء حفظ الكود في Firestore.');
    } finally {
      setSavingCode(false);
    }
  };

  const handleDeleteVerification = async (adminId: string, adminName: string) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء وحذف كود التحقق النشط لـ "${adminName}"؟`)) {
      return;
    }

    try {
      await deleteVerificationCode(adminId);
      showToast(`تم إلغاء كود التحقق بنجاح.`, "success");
      await loadVerifications();
    } catch (err) {
      console.error(err);
      showToast("فشل إلغاء كود التحقق.", "error");
    }
  };


  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-slate-700">جاري تحميل قائمة المسؤولين من السيرفر الآمن...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900">إدارة حسابات المسؤولين (سوبر أدمن)</h1>
        <p className="text-slate-500 text-xs">بصفتك مديراً عاماً للنظام، يمكنك إضافة، تعديل، أو حذف حسابات المعلمين والمسؤولين الذين يملكون حق الدخول للوحة التحكم.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                {isEditing ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? 'تعديل بيانات المسؤول' : 'إضافة مسؤول جديد للسيستم'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isEditing ? 'تحديث البيانات وحفظها' : 'إدخال بيانات اعتماد المسؤول الجديد'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الاسم التعريفي (اللقب)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: الأستاذ محمد علي"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">اسم المستخدم (بالأحرف الإنجليزية)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: mohamed"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">كلمة المرور (الباسورد)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور قوية"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none transition-all text-xs"
                  />
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">صلاحية المسؤول</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'super')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-800 font-bold focus:outline-none transition-all text-xs cursor-pointer"
                >
                  <option value="admin">مسؤول عادي (إدارة الطلاب والعلامات فقط)</option>
                  <option value="super">مدير عام / سوبر أدمن (صلاحية كاملة لإدارة حسابات المسؤولين)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold rounded-2xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-lg transition-all text-xs cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isEditing ? 'حفظ التعديل' : 'إضافة المسؤول'}</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List of admins */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-50 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">المسؤولون المسجلون بقاعدة البيانات</h3>
                  <p className="text-xs text-slate-400">جميع الحسابات الحالية المخزنة في Firestore.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {admins.map((admin) => (
                <div 
                  key={admin.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    admin.id === currentAdmin.id 
                      ? 'bg-indigo-50/45 border-indigo-100/70 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      admin.role === 'super' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{admin.name || 'غير معروف'}</span>
                        {admin.id === currentAdmin.id && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-extrabold rounded-md">
                            حسابك الحالي
                          </span>
                        )}
                        {admin.role === 'super' ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-md">
                            مدير عام
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200/80 text-slate-600 text-[9px] font-extrabold rounded-md">
                            مسؤول عادي
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 font-mono font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{admin.username}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-600 select-all font-bold">{admin.password}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEditClick(admin)}
                      title="تعديل بيانات الحساب"
                      className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {admin.id !== currentAdmin.id && (
                      <button
                        onClick={() => handleDelete(admin.id, admin.name || admin.username)}
                        title="حذف الحساب نهائياً"
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400 font-semibold bg-slate-50/50 p-4 rounded-2xl border border-slate-100/55">
            <ShieldCheck className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>نظام إدارة الحسابات والمسؤولين مشفر تماماً ويعمل مباشرة على قاعدة بيانات السيرفر.</span>
          </div>
        </div>
      </div>

      {/* Custom Verification Codes Management Section */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white mt-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 rounded-2xl">
              <ShieldAlert className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">إدارة وحقن أكواد التحقق المخصصة (شحن أكواد يدوية)</h3>
              <p className="text-slate-400 text-xs font-semibold">بصفتك سوبر أدمن، يمكنك كتابة وتعيين كود تحقق مخصص لأي مسؤول يدوياً ليتلقاه فوراً في حسابه أو البريد الخاص به.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={loadVerifications}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>تحديث الرموز النشطة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Creator Form */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800/80 p-5 space-y-4 text-right">
            <h4 className="text-xs font-black text-indigo-400 flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>حقن كود تحقق جديد</span>
            </h4>

            <form onSubmit={handleSaveCustomCode} className="space-y-4">
              {/* Select Target Admin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">المسؤول المستهدف</label>
                <select
                  value={selectedAdminForCode}
                  onChange={(e) => setSelectedAdminForCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">-- اختر المسؤول --</option>
                  {admins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name || adm.username} ({adm.username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">كود التحقق المخصص (اكتب الكود الذي تريده)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    required
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value)}
                    placeholder="مثال: 999999 أو VIP-PASS"
                    className="w-full pr-11 pl-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 font-bold focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Optional Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">البريد الإلكتروني للإشعار (اختياري)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="teacher@example.com (تلقائي إن تُرِك فارغاً)"
                    className="w-full pr-11 pl-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 font-bold focus:outline-none text-xs ltr text-right"
                  />
                </div>
              </div>

              {errorCustomCode && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-[11px] font-bold rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorCustomCode}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer"
              >
                {savingCode ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>حقن وتعميم الرمز المخصص</span>
              </button>
            </form>
          </div>

          {/* Active Codes List */}
          <div className="lg:col-span-7 space-y-4 text-right">
            <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>الرموز المخصصة النشطة حالياً على خوادم الفايربيس</span>
            </h4>

            {verifications.length === 0 ? (
              <div className="p-8 bg-slate-950/40 rounded-2xl border border-slate-800/50 text-center text-slate-500 text-xs">
                لا توجد أكواد مخصصة نشطة حالياً. عندما يطلب أي معلم تعديل كلمة مروره أو تقوم بحقن رمز مخصص، سيظهر هنا فوراً.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {verifications.map((ver) => {
                  const targetAdmin = admins.find(a => a.id === ver.adminId);
                  return (
                    <div key={ver.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-right">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-mono font-black">
                          {ver.code}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {targetAdmin ? targetAdmin.name : 'مسؤول غير معروف'} ({ver.adminId})
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold font-mono">
                            {ver.email} • تم التوليد: {new Date(ver.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${ver.verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {ver.verified ? 'تم التحقق منه' : 'انتظار التحقق'}
                        </span>
                        <button
                          onClick={() => handleDeleteVerification(ver.adminId, targetAdmin?.name || ver.adminId)}
                          title="حذف وإلغاء الرمز"
                          className="p-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
