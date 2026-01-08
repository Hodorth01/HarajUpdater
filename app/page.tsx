'use client'
import { useState } from 'react';
import { getHarajAccountData, saveHarajBotConfig } from './actions';
import { Bot, CheckCircle2, Clock, ShieldCheck, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

export default function HarajDashboard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false); 
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // States to track input completion for Step 1
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Helper to check if login form is valid
  const isLoginFormValid = username.trim().length > 0 && password.trim().length > 0;

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true); // Instant UI feedback
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await getHarajAccountData(formData);
      if (res.success) {
        setData(res);
        setStep(2);
      } else {
        setError(res.error || "Login failed, check your credentials");
      }
    } catch (e) {
      setError("Connection error, please try again later");
    } finally {
      setLoading(false);
    }
  }
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
      if (res.success) {
        setStep(3);
      } else {
        setError(res.error || "فشل في حفظ الإعدادات");
      }
    } catch (e) {
      setError("حدث خطأ غير متوقع أثناء التفعيل");
    } finally {
      setDeploying(false);
    }
  }
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans" dir="rtl">
      
      {error && (
        <div className="mb-6 w-full max-w-xl bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {step === 1 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
               <Bot className="text-blue-500" size={32} />
               <h1 className="text-2xl font-bold tracking-tight text-right">بوت حراج برو</h1>
            </div>
            
            <div className="space-y-4">
              <input 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="رقم الجوال أو اسم المستخدم" 
                className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500 transition disabled:opacity-50 text-right" 
                required 
                disabled={loading} 
              />
              <input 
                name="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور" 
                className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-zinc-700 focus:border-blue-500 transition disabled:opacity-50 text-right" 
                required 
                disabled={loading} 
              />
            </div>

            <button 
              type="submit" 
              // Disabled if loading OR if form is not filled
              disabled={loading || !isLoginFormValid} 
              className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 
                ${(!isLoginFormValid || loading) 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                  : 'bg-blue-600 hover:bg-blue-500 cursor-pointer active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                'الدخول لإعلاناتي'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form action={handleDeploy} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="text-green-500 ml-1"/> اختر الإعلانات لتحديثها
            </h2>
            
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pl-1 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
              {data.posts.map((post: any) => (
                <div key={post.id} 
                     onClick={() => !deploying && (selected.includes(post.id) ? setSelected(selected.filter(i => i !== post.id)) : setSelected([...selected, post.id]))}
                     className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${selected.includes(post.id) ? 'bg-blue-600/10 border-blue-500' : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'} ${deploying ? 'opacity-50 cursor-wait' : ''}`}>
                  <img
                    src={`/api/image?filename=${post.thumbURL}&sessionId=fetch_${data.username}&size=140x140&format=webp`}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-800"
                    alt=""
                  />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold truncate">{post.title}</p>
                    <p className="text-xs text-zinc-500">رقم الإعلان: {post.id}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected.includes(post.id) ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'}`}>
                    {selected.includes(post.id) && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-800/80 p-5 rounded-2xl border border-zinc-700">
                <label className="text-xs text-zinc-400 uppercase font-bold flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-blue-400" /> وقت التحديث التلقائي (كل 24 ساعة)
                </label>
                
                <div className="flex items-center justify-center gap-4 flex-row-reverse">
                  <div className="relative group flex-1">
                    <select name="hour" disabled={deploying} className="w-full bg-zinc-900 text-2xl font-bold px-4 py-2 rounded-lg outline-none border border-zinc-700 cursor-pointer appearance-none pl-10 focus:border-blue-500 transition disabled:opacity-50 text-center">
                      {hours.map(h => <option key={h} value={h} className="bg-zinc-900 text-base">{h}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition" />
                  </div>
                  
                  <span className="text-2xl font-bold text-zinc-600">:</span>

                  <div className="relative group flex-1">
                    <select name="minute" disabled={deploying} className="w-full bg-zinc-900 text-2xl font-bold px-4 py-2 rounded-lg outline-none border border-zinc-700 cursor-pointer appearance-none pl-10 focus:border-blue-500 transition disabled:opacity-50 text-center">
                      {minutes.map(m => <option key={m} value={m} className="bg-zinc-900 text-base">{m}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition" />
                  </div>
                </div>
            </div>

            <button 
            type="submit" 
            disabled={selected.length === 0 || deploying} 
            className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 
                ${selected.length === 0 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                : deploying 
                    ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                    : 'bg-green-600 hover:bg-green-500 cursor-pointer shadow-lg shadow-green-900/10 active:scale-[0.98]' 
                }`}
            >
            {deploying ? (
                <>
                <Loader2 className="animate-spin text-green-500" size={20} />
                <span>جاري تشغيل الأتمتة...</span>
                </>
            ) : (
                'تفعيل التحديث التلقائي'
            )}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-green-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <ShieldCheck className="text-green-500" size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">تم تفعيل البوت</h2>
              <p className="text-zinc-400 max-w-xs mx-auto text-sm leading-relaxed">
                سيتم تحديث إعلاناتك المختارة يومياً في الوقت الذي اخترته بنجاح.
              </p>
            </div>
            <button 
              onClick={() => { setStep(1); setSelected([]); setError(null); }} 
              className="text-blue-500 font-medium hover:text-blue-400 transition cursor-pointer"
            >
              إعداد حساب آخر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}