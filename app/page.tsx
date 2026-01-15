'use client';

import { useState } from 'react';
import { getHarajAccountData, saveHarajBotConfig } from './actions';
import { Bot, CheckCircle2, Clock, ShieldCheck, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

export default function HarajDashboard() {
  // UI and Data States
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form Input States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isLoginFormValid = username.trim().length > 0 && password.trim().length > 0;
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  /**
   * Step 1: Handle Haraj Login & Fetch Ads
   */
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await getHarajAccountData(formData);
      if (res.success) {
        setData(res);
        setStep(2);
      } else {
        setError(res.error || "Login failed, check credentials");
      }
    } catch (err) {
      setError("Connection error, please try again");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Step 2: Save automation configuration to DB
   */
  async function handleDeploy(formData: FormData) {
    setError(null);
    setDeploying(true);
    try {
      const h = formData.get('hour');
      const m = formData.get('minute');

      formData.set('username', data.username);
      formData.set('password', data.password);
      formData.set('postIds', selected.join(','));
      formData.set('time', `${h}:${m}`);

      const res = await saveHarajBotConfig(formData);
      if (res.success) setStep(3);
      else setError(res.error || "Failed to save settings");
    } catch (err) {
      setError("Unexpected error during activation");
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center font-sans" dir="rtl">
      
      {/* Error Notifications */}
      {error && (
        <div className="mb-6 w-full max-w-xl bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content Area: Centered vertically */}
      <main className="flex-1 flex flex-col items-center justify-center w-full py-12">
        <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* STEP 1: Login Form */}
          {step === 1 && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <Bot className="text-blue-500" size={32} />
                <h1 className="text-2xl font-bold tracking-tight">بوت حراج برو</h1>
              </div>

              <div className="space-y-4">
                <input
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="رقم الجوال أو اسم المستخدم"
                  className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500 transition disabled:opacity-50"
                  required
                  disabled={loading}
                />
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500 transition disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isLoginFormValid}
                className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 
                  ${(!isLoginFormValid || loading)
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'}`}
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> جاري التحقق...</> : 'الدخول لإعلاناتي'}
              </button>
            </form>
          )}

          {/* STEP 2: Ad Selection & Time Config */}
          {step === 2 && (
            <form action={handleDeploy} className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="text-green-500 ml-1" /> اختر الإعلانات لتحديثها
              </h2>

              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pl-1 scrollbar-hide">
                <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                {data.posts.map((post: any) => (
                  <div
                    key={post.id}
                    onClick={() => !deploying && (selected.includes(post.id) ? setSelected(selected.filter(i => i !== post.id)) : setSelected([...selected, post.id]))}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${selected.includes(post.id) ? 'bg-blue-600/10 border-blue-500' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'} ${deploying ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <img
                      src={`/api/image?filename=${post.thumbURL}&sessionId=fetch_${data.username}&size=140x140&format=webp`}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-800"
                      alt=""
                    />
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-semibold truncate">{post.title}</p>
                      <p className="text-xs text-zinc-500">ID: {post.id}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected.includes(post.id) ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'}`}>
                      {selected.includes(post.id) && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-800/80 p-5 rounded-2xl border border-zinc-700">
                <label className="text-xs text-zinc-400 uppercase font-bold flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-blue-400" /> وقت التحديث التلقائي
                </label>
                <div className="flex items-center justify-center gap-4 flex-row-reverse">
                  <TimeSelect name="hour" options={hours} disabled={deploying} />
                  <span className="text-2xl font-bold text-zinc-600">:</span>
                  <TimeSelect name="minute" options={minutes} disabled={deploying} />
                </div>
              </div>

              <button
                type="submit"
                disabled={selected.length === 0 || deploying}
                className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 
                  ${selected.length === 0 || deploying ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
              >
                {deploying ? <><Loader2 className="animate-spin" size={20} /> جاري التفعيل...</> : 'تفعيل التحديث التلقائي'}
              </button>
            </form>
          )}

          {/* STEP 3: Success View */}
          {step === 3 && (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-green-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <ShieldCheck className="text-green-500" size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-2">تم تفعيل البوت</h2>
              <p className="text-zinc-400 max-w-xs mx-auto text-sm leading-relaxed">سيتم تحديث إعلاناتك المختارة يومياً بنجاح.</p>
              <button onClick={() => { setStep(1); setSelected([]); setError(null); }} className="text-blue-500 font-medium hover:underline">إعداد حساب آخر</button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Reusable Time Select Component
 */
function TimeSelect({ name, options, disabled }: { name: string, options: string[], disabled: boolean }) {
  return (
    <div className="relative group flex-1">
      <select name={name} disabled={disabled} className="w-full bg-zinc-900 text-2xl font-bold px-4 py-2 rounded-lg outline-none border border-zinc-700 cursor-pointer appearance-none pl-10 focus:border-blue-500 transition disabled:opacity-50 text-center">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}

/**
 * Global Footer Component
 */
function Footer() {
  return (
    <footer className="w-full max-w-xl py-6 mt-auto text-center border-t border-zinc-800/50">
      <div className="flex flex-col gap-2 items-center justify-center text-md">
        <div className="flex items-center gap-2 text-zinc-500">
          <ShieldCheck size={14} className="text-green-500/70" />
          <span>البيانات الحساسة مشفرة ومحمية بالكامل</span>
          <span className="text-zinc-800">|</span>
          <span>© {new Date().getFullYear()} حراج برو</span>
        </div>
        <p className="text-zinc-600">
          تم التطوير بواسطة
          <a href="https://thamer.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors ms-1">
          {" "} ثامر 
          </a>
        </p>
      </div>
    </footer>
  );
}