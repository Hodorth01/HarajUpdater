'use client'
import { handleUserRegistration } from './actions';
import { useState } from 'react';
import { Plus, Trash2, Bot } from 'lucide-react';

export default function HarajDashboard() {
    const [msg, setMsg] = useState('');
    const [postIds, setPostIds] = useState(['']);

    const addPostField = () => setPostIds([...postIds, '']);
    
    const updatePostField = (index: number, value: string) => {
        const newPosts = [...postIds];
        newPosts[index] = value;
        setPostIds(newPosts);
    };

    const removePostField = (index: number) => {
        if (postIds.length > 1) {
            setPostIds(postIds.filter((_, i) => i !== index));
        }
    };

    async function clientAction(formData: FormData) {
        const combinedIds = postIds.filter(id => id.trim() !== '').join(',');
        formData.set('postIds', combinedIds);

        const result = await handleUserRegistration(formData);
        if (result.error) setMsg(result.error);
        if (result.success) setMsg(result.success);
    }

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Bot size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Haraj Bot Pro</h1>
                </div>
                
                {/* Status Message */}
                {msg && (
                    <div className={`p-4 rounded-xl mb-6 border animate-in fade-in zoom-in duration-300 ${
                        msg.includes('Success') || msg.includes('ready') 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                    }`}>
                        {msg}
                    </div>
                )}

                <form action={clientAction} className="space-y-5">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Identity</label>
                        <input name="username" type="text" placeholder="Phone or Username" 
                            className="w-full bg-zinc-800 border-zinc-700 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Security</label>
                        <input name="password" type="password" placeholder="Haraj Password" 
                            className="w-full bg-zinc-800 border-zinc-700 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                    </div>

                    {/* Post IDs Section */}
                    <div className="space-y-3">
                        <div className="space-y-2  pr-1">
                            <label className="text-xs font-medium text-zinc-500 uppercase">Target Post IDs</label>
                            {postIds.map((id, index) => (
                                <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                    <input 
                                        type="text" 
                                        value={id}
                                        placeholder={`Post ID #${index + 1}`}
                                        onChange={(e) => updatePostField(index, e.target.value)}
                                        className="flex-1 bg-zinc-800 border-zinc-700 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                        required 
                                    />
                                    {postIds.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removePostField(index)} 
                                            className="cursor-pointer p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-between items-center ml-1">
                            <button 
                                type="button" 
                                onClick={addPostField} 
                                className="cursor-pointer text-blue-500 hover:text-blue-400 flex items-center gap-1 text-xs font-bold transition-colors"
                            >
                                <Plus size={14} /> Add Post
                            </button>
                        </div>
                    </div>

                    {/* Time Selector */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Refresh Schedule</label>
                        <input name="time" type="time" 
                            className="w-full bg-zinc-800 border-zinc-700 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer" required />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                    >
                        Deploy Automation Bot
                    </button>
                </form>
                
                <p className="mt-6 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
                    Encrypted Connection &bull; 2026 Stable Build
                </p>
            </div>
        </main>
    );
}