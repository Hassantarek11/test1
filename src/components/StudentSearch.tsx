import React, { useState } from 'react';
import { Search, IdCard, ShieldCheck } from 'lucide-react';
import { Student } from '../types';
import { getApiUrl } from '../config';

interface StudentSearchProps {
  onSearchResult: (student: Student) => void;
  onNavigateToVerify: (hash: string) => void;
  onNavigateToAdmin: () => void;
}

export default function StudentSearch({ onSearchResult, onNavigateToVerify, onNavigateToAdmin }: StudentSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('الرجاء إدخال رقم الجلوس أو الرقم القومي');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(`/api/student/search?query=${encodeURIComponent(query.trim())}`));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالخادم');
      }

      onSearchResult(data.student);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء البحث، الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      {/* Institute Brand Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
          معهد عبد الفتاح عزام بنين
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          المنصة الإلكترونية الرسمية المعتمدة للاستعلام عن نتائج الطلاب وتوثيق الشهادات الدراسية مع تفعيل الدفع الإلكتروني الآمن.
        </p>
      </div>

      {/* Main Search Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            البحث عن بيانات طالب
          </h2>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
            العام الدراسي 2025/2026
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجلوس أو الرقم القومي (14 رقماً)
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <input
                id="search-input"
                type="text"
                className="block w-full px-4 py-3.5 pr-11 text-gray-900 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
                placeholder="أدخل رقم الجلوس (مثال: 1001) أو الرقم القومي..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <IdCard className="w-5 h-5" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3.5 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري البحث والتحقق...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                <span>عرض النتيجة والشهادة</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
