import { useMemo, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  products: Product[];
  onPick: (p: Product) => void;
  onClose: () => void;
}

export function ProductPicker({ products, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Select saved product</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto px-3 pb-3 space-y-1.5">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              {products.length === 0 ? 'No saved products yet. Add one below.' : 'No matches found.'}
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-colors text-left"
            >
              <div>
                <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-500">per {p.unit}</p>
              </div>
              <span className="text-sm font-semibold text-teal-700">؋ {p.defaultPrice.toLocaleString('en-US')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
