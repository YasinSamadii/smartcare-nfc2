"use client";
import React, { useState, useEffect } from 'react';

export default function RoalTagApp() {
  const [view, setView] = useState('manager');
  const [roaviState, setRoaviState] = useState('welcome');
  const [stats, setStats] = useState({ today_patients: 72, visits: 48, waiting: 8, avg_wait_time: 12 });
  const [activePatient, setActivePatient] = useState<any>(null);
  
  const handleNfcTap = async (tokenId: string) => {
    setRoaviState('smart-tap');
    setTimeout(async () => {
      setRoaviState('scanning');
      try {
        const res = await fetch(`http://localhost:8000/api/v1/queue/tap`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token_id: tokenId })
        });
        if(res.ok) {
           const data = await res.json();
           setActivePatient(data.patient);
           setRoaviState('success');
           setView('doctor');
        } else {
           setRoaviState('calm-idle');
           alert("خطا: تگ نامعتبر");
        }
      } catch(e) { console.error(e); }
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-roal-surface text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-roal-navy text-white flex flex-col p-4">
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold">ROAL TAG</h1>
           <p className="text-xs text-roal-mint">ضربان منظم زمان</p>
           <p className="text-[10px] text-gray-400 mt-2">شرکت هوشمند سازان روال</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setView('manager')} className={`w-full text-right p-3 rounded ${view === 'manager' ? 'bg-roal-turquoise' : 'hover:bg-slate-700'}`}>داشبورد مدیریت</button>
          <button onClick={() => setView('doctor')} className={`w-full text-right p-3 rounded ${view === 'doctor' ? 'bg-roal-turquoise' : 'hover:bg-slate-700'}`}>پنل پزشک</button>
        </nav>
        
        {/* Roavi Mascot Widget */}
        <div className="mt-auto text-center p-4 bg-slate-800 rounded-xl border border-slate-700 roavi-float">
           <div className="text-roal-mint mb-2">وضعیت روآوی: {roaviState}</div>
           <div className="text-xs text-gray-400">تگ‌خوان: فعال ((•))</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
           <div className="text-lg font-bold">کلینیک مرکزی</div>
           <div className="flex gap-4">
             <button onClick={() => handleNfcTap('8F3A-2C9D-7E41')} className="bg-roal-blue text-white px-4 py-2 rounded-lg text-sm">شبیه‌ساز NFC حامد رضایی</button>
             <button onClick={() => handleNfcTap('RT-UUID-98231')} className="bg-roal-blue text-white px-4 py-2 rounded-lg text-sm">شبیه‌ساز مریم احمدی</button>
           </div>
        </header>

        {view === 'manager' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-roal-navy">داشبورد مدیریت کلینیک</h2>
            <div className="grid grid-cols-4 gap-4">
               {Object.entries(stats).map(([k,v]) => (
                  <div key={k} className="glass-panel p-6 rounded-2xl border-l-4 border-roal-turquoise">
                     <div className="text-sm text-gray-500">{k}</div>
                     <div className="text-3xl font-bold text-roal-navy mt-2">{v}</div>
                  </div>
               ))}
            </div>
            {/* Additional Manager UI here matching mockup */}
            <div className="glass-panel p-6 rounded-2xl h-64 flex items-center justify-center text-gray-400">نمودارها و ظرفیت اتاق‌ها...</div>
          </div>
        )}

        {view === 'doctor' && (
          <div className="space-y-6">
             <h2 className="text-xl font-bold text-roal-navy">پرونده بیمار</h2>
             {activePatient ? (
                <div className="glass-panel p-6 rounded-2xl">
                   <div className="flex justify-between items-start border-b pb-4">
                      <div>
                         <h3 className="text-2xl font-bold">{activePatient.name}</h3>
                         <p className="text-sm text-gray-500">کد ملی: {activePatient.id}</p>
                      </div>
                      <div className="bg-roal-mint text-roal-navy px-3 py-1 rounded-full text-sm font-bold">در حال ویزیت</div>
                   </div>
                   <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${activePatient.allergies !== 'ندارد' ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                         <strong>حساسیت‌ها:</strong> <span className={activePatient.allergies !== 'ندارد' ? 'text-red-600' : ''}>{activePatient.allergies}</span>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="text-center py-20 text-gray-400 glass-panel rounded-2xl">منتظر اسکن تگ NFC...</div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
