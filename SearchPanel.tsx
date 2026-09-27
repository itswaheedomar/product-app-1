import { useMemo, useState } from 'react';
import { Search, Package, Calendar } from 'lucide-react';
import { AppData, entryTotal, formatDisplayDate, formatAFN } from '@/lib/types';

interface Props {
  data: AppData;
  onSelectDate: (d: string) => void;
}

export function SearchPanel({ data, onSelectDate }: Props) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const productMatches = useMemo(() => {
    if (!q) return [];
    return data.products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 20);
  }, [data.products, q]);

  const recordMatches = useMemo(() => {
    if (!q) return [];
    const results: { date: string; productName: string; quantity: number; unit: string; unitPrice: number; total: number; notes: string }[] = [];
    for (const [dateKey, day] of Object.entries(data.records)) {
      for (const e of day.entries) {
        if (
          e.productName.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
        ) {
          results.push({
            date: dateKey,
            productName: e.productName,
            quantity: e.quantity,
            unit: e.unit,
            unitPrice: e.unitPrice,
            total: entryTotal(e),
            notes: e.notes,
          });
        }
      }
    }
    return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  }, [data.records, q]);

  if (!query) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 px-4 text-center">
        <Search size={36} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm">Search across all saved products and past records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {productMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Package size={16} className="text-teal-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Saved Products ({productMatches.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {productMatches.map((p) => (
              <div key={p.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">per {p.unit}</p>
                </div>
                <span className="text-sm font-semibold text-teal-700">{formatAFN(p.defaultPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recordMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Calendar size={16} className="text-teal-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Records ({recordMatches.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recordMatches.map((r, i) => (
              <button
                key={i}
                onClick={() => onSelectDate(r.date)}
                className="w-full px-4 py-3 text-left hover:bg-teal-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800">{r.productName}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatAFN(r.total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatDisplayDate(r.date)}</span>
                  <span>{r.quantity} {r.unit} × {formatAFN(r.unitPrice)}</span>
                </div>
                {r.notes && <p className="text-xs text-slate-400 mt-1">{r.notes}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {productMatches.length === 0 && recordMatches.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 px-4 text-center">
          <p className="text-slate-500 text-sm">No results for "{query}".</p>
        </div>
      )}
    </div>
  );
}
