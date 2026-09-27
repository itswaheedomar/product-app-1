import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { AppData, dayTotal, formatDisplayDate, formatAFN, formatMonthYear } from '@/lib/types';

interface Props {
  data: AppData;
  onSelectDate: (d: string) => void;
  currentDate: string;
}

export function HistoryPanel({ data, onSelectDate, currentDate }: Props) {
  const sortedKeys = useMemo(
    () => Object.keys(data.records).sort((a, b) => b.localeCompare(a)),
    [data.records]
  );

  // group by year > month
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, string[]>> = {};
    for (const key of sortedKeys) {
      const [y, m] = key.split('-');
      if (!map[y]) map[y] = {};
      if (!map[y][m]) map[y][m] = [];
      map[y][m].push(key);
    }
    return map;
  }, [sortedKeys]);

  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const [openYear, setOpenYear] = useState<string | null>(years[0] ?? null);
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  if (sortedKeys.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 px-4 text-center">
        <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm">No records yet. Start adding products to build your history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 px-1">Tap a day to open its records. Days are grouped by month and year.</p>
      {years.map((y) => {
        const months = Object.keys(grouped[y]).sort((a, b) => b.localeCompare(a));
        const yearOpen = openYear === y;
        return (
          <div key={y} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setOpenYear(yearOpen ? null : y)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-800">{y}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{months.length} month{months.length !== 1 ? 's' : ''}</span>
                {yearOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
              </div>
            </button>
            {yearOpen && (
              <div className="divide-y divide-slate-100">
                {months.map((m) => {
                  const days = grouped[y][m];
                  const monthKey = `${y}-${m}`;
                  const monthOpen = openMonth === monthKey;
                  const monthTotal = days.reduce((s, d) => s + dayTotal(data.records[d]), 0);
                  return (
                    <div key={m}>
                      <button
                        onClick={() => setOpenMonth(monthOpen ? null : monthKey)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 pl-8"
                      >
                        <span className="text-sm font-medium text-slate-700">{formatMonthYear(`${y}-${m}-01`)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{formatAFN(monthTotal)}</span>
                          {monthOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                        </div>
                      </button>
                      {monthOpen && (
                        <div className="divide-y divide-slate-50">
                          {days.map((d) => {
                            const active = d === currentDate;
                            return (
                              <button
                                key={d}
                                onClick={() => onSelectDate(d)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 pl-12 text-sm hover:bg-teal-50/50 transition-colors ${
                                  active ? 'bg-teal-50 text-teal-800 font-medium' : 'text-slate-600'
                                }`}
                              >
                                <span>{formatDisplayDate(d)}</span>
                                <span className="text-xs text-slate-500">{formatAFN(dayTotal(data.records[d]))}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
