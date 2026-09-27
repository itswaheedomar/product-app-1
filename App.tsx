import { useEffect, useState } from 'react';
import { History, Search, Package, Settings, NotebookPen } from 'lucide-react';
import { AppData, todayKey } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';
import { DailyView } from '@/components/DailyView';
import { HistoryPanel } from '@/components/HistoryPanel';
import { SearchPanel } from '@/components/SearchPanel';
import { ProductsPanel } from '@/components/ProductsPanel';
import { SettingsPanel } from '@/components/SettingsPanel';

type Tab = 'today' | 'history' | 'search' | 'products' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof NotebookPen }[] = [
  { id: 'today', label: 'Records', icon: NotebookPen },
  { id: 'history', label: 'History', icon: History },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function App() {
  const [data, setDataState] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('today');
  const [currentDate, setCurrentDate] = useState<string>(todayKey());

  useEffect(() => {
    saveData(data);
  }, [data]);

  function setData(updater: (prev: AppData) => AppData) {
    setDataState((prev) => updater(prev));
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              ؋
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight text-sm sm:text-base">Afghan Product Records</h1>
              <p className="text-xs text-slate-400 leading-tight hidden sm:block">Daily purchase tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    active ? 'bg-teal-50 text-teal-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label={t.label}
                  title={t.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 pb-24 sm:pb-8">
        {tab === 'today' && (
          <DailyView
            data={data}
            setData={setData}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
        {tab === 'history' && (
          <HistoryPanel data={data} onSelectDate={(d) => { setCurrentDate(d); setTab('today'); }} currentDate={currentDate} />
        )}
        {tab === 'search' && (
          <SearchPanel data={data} onSelectDate={(d) => { setCurrentDate(d); setTab('today'); }} />
        )}
        {tab === 'products' && <ProductsPanel data={data} setData={setData} />}
        {tab === 'settings' && <SettingsPanel data={data} setData={setData} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  active ? 'text-teal-700' : 'text-slate-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
