import { useState } from 'react';
import { Plus, Pencil, Check, X, Trash2, Package } from 'lucide-react';
import { AppData, Product, uid, COMMON_UNITS, formatAFN } from '@/lib/types';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export function ProductsPanel({ data, setData }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Product>({ id: '', name: '', unit: 'عدد', defaultPrice: 0 });

  const products = [...data.products].sort((a, b) => a.name.localeCompare(b.name));

  function startAdd() {
    setDraft({ id: '', name: '', unit: 'عدد', defaultPrice: 0 });
    setAdding(true);
    setEditingId(null);
  }

  function saveProduct(p: Product) {
    if (!p.name.trim()) return;
    setData((prev) => {
      const exists = prev.products.find((x) => x.id === p.id);
      if (exists) {
        return { ...prev, products: prev.products.map((x) => (x.id === p.id ? p : x)) };
      }
      return { ...prev, products: [...prev.products, p] };
    });
    setAdding(false);
    setEditingId(null);
  }

  function deleteProduct(id: string) {
    if (!confirm('Delete this saved product? Existing records keep their data.')) return;
    setData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Products saved for quick reuse on any day.</p>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {adding && (
        <ProductEditor
          product={draft}
          onSave={(p) => saveProduct({ ...p, id: uid() })}
          onCancel={() => setAdding(false)}
        />
      )}

      {products.length === 0 && !adding ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 px-4 text-center">
          <Package size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No saved products yet. Add products here or select "New" on a day to save them automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {products.map((p) => {
            if (editingId === p.id) {
              return (
                <ProductEditor
                  key={p.id}
                  product={p}
                  onSave={(updated) => saveProduct({ ...updated, id: p.id })}
                  onCancel={() => setEditingId(null)}
                />
              );
            }
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500">per {p.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-teal-700">{formatAFN(p.defaultPrice)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(p.id); setAdding(false); }} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductEditor({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Product>(product);
  return (
    <div className="p-4 bg-teal-50/40 space-y-3">
      <div>
        <label className="text-xs text-slate-500">Product Name</label>
        <input
          value={d.name}
          onChange={(e) => setD({ ...d, name: e.target.value })}
          placeholder="e.g. Rice, Sugar, Oil"
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Unit</label>
          <select
            value={d.unit}
            onChange={(e) => setD({ ...d, unit: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Default Price (؋)</label>
          <input
            type="number"
            min={0}
            step="any"
            value={d.defaultPrice}
            onChange={(e) => setD({ ...d, defaultPrice: parseFloat(e.target.value) || 0 })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { if (d.name.trim()) onSave(d); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
          <Check size={15} /> Save
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">
          <X size={15} /> Cancel
        </button>
      </div>
    </div>
  );
}
