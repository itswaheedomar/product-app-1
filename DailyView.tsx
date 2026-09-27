import { useEffect, useState } from 'react';
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Calendar,
  Package, Pencil, Check, X, Search,
} from 'lucide-react';
import {
  AppData, DayRecord, RecordEntry, Product, uid, todayKey,
  dateKey, formatDisplayDate, formatAFN, entryTotal, dayTotal,
  COMMON_UNITS,
} from '@/lib/types';
import { ProductPicker } from './ProductPicker';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
  currentDate: string;
  setCurrentDate: (d: string) => void;
}

export function DailyView({ data, setData, currentDate, setCurrentDate }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<Partial<RecordEntry> | null>(null);

  const day: DayRecord = data.records[currentDate] ?? { date: currentDate, entries: [] };
  const total = dayTotal(day);

  function shiftDate(days: number) {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setCurrentDate(dateKey(d));
  }

  function goToday() {
    setCurrentDate(todayKey());
  }

  function startBlankRow() {
    setNewRow({ productName: '', quantity: 1, unit: 'عدد', unitPrice: 0, notes: '' });
    setEditingId(null);
  }

  function pickProduct(p: Product) {
    setNewRow({
      productId: p.id,
      productName: p.name,
      quantity: 1,
      unit: p.unit,
      unitPrice: p.defaultPrice,
      notes: '',
    });
    setShowPicker(false);
    setEditingId(null);
  }

  function commitEntry(entry: RecordEntry) {
    setData((prev) => {
      const dayRec = prev.records[currentDate] ?? { date: currentDate, entries: [] };
      const existsIdx = dayRec.entries.findIndex((e) => e.id === entry.id);
      const entries =
        existsIdx >= 0
          ? dayRec.entries.map((e, i) => (i === existsIdx ? entry : e))
          : [...dayRec.entries, entry];

      // Auto-save product to catalog if it doesn't exist (for blank-row entries)
      let products = prev.products;
      if (!entry.productId) {
        const existing = products.find(
          (p) => p.name.toLowerCase() === entry.productName.trim().toLowerCase()
        );
        if (!existing && entry.productName.trim()) {
          products = [
            ...products,
            { id: uid(), name: entry.productName.trim(), unit: entry.unit, defaultPrice: entry.unitPrice },
          ];
        }
      }

      return {
        ...prev,
        products,
        records: { ...prev.records, [currentDate]: { date: currentDate, entries } },
      };
    });
    setNewRow(null);
    setEditingId(null);
  }

  function deleteEntry(id: string) {
    setData((prev) => {
      const dayRec = prev.records[currentDate];
      if (!dayRec) return prev;
      const entries = dayRec.entries.filter((e) => e.id !== id);
      const newRecords = { ...prev.records };
      if (entries.length === 0) {
        delete newRecords[currentDate];
      } else {
        newRecords[currentDate] = { date: currentDate, entries };
      }
      return { ...prev, records: newRecords };
    });
  }

  function deleteDay() {
    if (!confirm(`Delete all records for ${formatDisplayDate(currentDate)}?`)) return;
    setData((prev) => {
      const newRecords = { ...prev.records };
      delete newRecords[currentDate];
      return { ...prev, records: newRecords };
    });
  }

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar size={16} className="text-teal-600" />
              <h2 className="font-semibold text-slate-800">{formatDisplayDate(currentDate)}</h2>
            </div>
            {currentDate !== todayKey() && (
              <button onClick={goToday} className="text-xs text-teal-600 mt-1 hover:underline">
                Go to today
              </button>
            )}
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {day.entries.length === 0 && !newRow ? (
          <div className="py-12 px-4 text-center">
            <Package size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm mb-4">No products recorded for this day.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <Search size={16} /> Select saved product
              </button>
              <button
                onClick={startBlankRow}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Plus size={16} /> Add new product
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-3 text-left w-10">No.</th>
                    <th className="px-3 py-3 text-left">Product Name</th>
                    <th className="px-3 py-3 text-right w-20">Quantity</th>
                    <th className="px-3 py-3 text-left w-24">Unit</th>
                    <th className="px-3 py-3 text-right w-28">Unit Price</th>
                    <th className="px-3 py-3 text-right w-32">Total</th>
                    <th className="px-3 py-3 text-left">Notes</th>
                    <th className="px-3 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {day.entries.map((e, i) => (
                    <EntryRow
                      key={e.id}
                      index={i + 1}
                      entry={e}
                      editing={editingId === e.id}
                      onStartEdit={() => setEditingId(e.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onSave={commitEntry}
                      onDelete={() => deleteEntry(e.id)}
                    />
                  ))}
                  {newRow && (
                    <EntryRow
                      index={day.entries.length + 1}
                      entry={newRow as RecordEntry}
                      editing
                      isNew
                      onStartEdit={() => {}}
                      onCancelEdit={() => setNewRow(null)}
                      onSave={commitEntry}
                      onDelete={() => {}}
                    />
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {day.entries.map((e, i) => (
                <MobileEntryCard
                  key={e.id}
                  index={i + 1}
                  entry={e}
                  editing={editingId === e.id}
                  onStartEdit={() => setEditingId(e.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={commitEntry}
                  onDelete={() => deleteEntry(e.id)}
                />
              ))}
              {newRow && (
                <MobileEntryCard
                  index={day.entries.length + 1}
                  entry={newRow as RecordEntry}
                  editing
                  isNew
                  onStartEdit={() => {}}
                  onCancelEdit={() => setNewRow(null)}
                  onSave={commitEntry}
                  onDelete={() => {}}
                />
              )}
            </div>
          </>
        )}

        {/* Add buttons when entries exist */}
        {(day.entries.length > 0 || newRow) && (
          <div className="flex gap-2 p-3 border-t border-slate-100">
            <button
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Search size={15} /> Saved
            </button>
            <button
              onClick={startBlankRow}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Plus size={15} /> New
            </button>
            {day.entries.length > 0 && (
              <button
                onClick={deleteDay}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} /> Clear day
              </button>
            )}
          </div>
        )}
      </div>

      {/* Daily total */}
      {day.entries.length > 0 && (
        <div className="bg-teal-700 rounded-xl shadow-sm p-4 flex items-center justify-between">
          <span className="text-teal-50 text-sm font-medium">Daily Total</span>
          <span className="text-white text-xl font-bold">{formatAFN(total)}</span>
        </div>
      )}

      {showPicker && (
        <ProductPicker
          products={data.products}
          onPick={pickProduct}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

/* ---------- Editable entry row (desktop) ---------- */
interface RowProps {
  index: number;
  entry: RecordEntry;
  editing: boolean;
  isNew?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: RecordEntry) => void;
  onDelete: () => void;
}

function EntryRow({ index, entry, editing, isNew, onStartEdit, onCancelEdit, onSave, onDelete }: RowProps) {
  const [draft, setDraft] = useState<RecordEntry>(entry);

  useEffect(() => {
    setDraft(entry);
  }, [JSON.stringify(entry)]);

  if (!editing) {
    return (
      <tr className="hover:bg-slate-50/50">
        <td className="px-3 py-2.5 text-slate-400">{index}</td>
        <td className="px-3 py-2.5 font-medium text-slate-800">{entry.productName}</td>
        <td className="px-3 py-2.5 text-right text-slate-700">{entry.quantity}</td>
        <td className="px-3 py-2.5 text-slate-600">{entry.unit}</td>
        <td className="px-3 py-2.5 text-right text-slate-700">{formatAFN(entry.unitPrice)}</td>
        <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatAFN(entryTotal(entry))}</td>
        <td className="px-3 py-2.5 text-slate-500 text-xs">{entry.notes || '—'}</td>
        <td className="px-3 py-2.5">
          <div className="flex gap-1 justify-end">
            <button onClick={onStartEdit} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-teal-50/40">
      <td className="px-3 py-2.5 text-slate-400">{index}</td>
      <td className="px-3 py-2.5">
        <input
          value={draft.productName}
          onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
          placeholder="Product name"
          className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min={0}
          step="any"
          value={draft.quantity}
          onChange={(e) => setDraft({ ...draft, quantity: parseFloat(e.target.value) || 0 })}
          className="w-20 px-2 py-1.5 rounded border border-slate-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </td>
      <td className="px-3 py-2.5">
        <select
          value={draft.unit}
          onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
          className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
        >
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min={0}
          step="any"
          value={draft.unitPrice}
          onChange={(e) => setDraft({ ...draft, unitPrice: parseFloat(e.target.value) || 0 })}
          className="w-28 px-2 py-1.5 rounded border border-slate-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </td>
      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatAFN(entryTotal(draft))}</td>
      <td className="px-3 py-2.5">
        <input
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="—"
          className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => {
              if (!draft.productName.trim()) return;
              onSave({ ...draft, id: draft.id || uid() });
            }}
            className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            <Check size={14} />
          </button>
          <button onClick={onCancelEdit} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ---------- Mobile entry card ---------- */
function MobileEntryCard({ index, entry, editing, isNew, onStartEdit, onCancelEdit, onSave, onDelete }: RowProps) {
  const [draft, setDraft] = useState<RecordEntry>(entry);
  useEffect(() => {
    setDraft(entry);
  }, [JSON.stringify(entry)]);

  if (!editing) {
    return (
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{index}.</span>
            <span className="font-medium text-slate-800">{entry.productName}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={onStartEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <Pencil size={15} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-slate-400">Quantity</p>
            <p className="text-slate-700">{entry.quantity} {entry.unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Unit Price</p>
            <p className="text-slate-700">{formatAFN(entry.unitPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="font-semibold text-slate-900">{formatAFN(entryTotal(entry))}</p>
          </div>
        </div>
        {entry.notes && <p className="text-xs text-slate-500 mt-2">{entry.notes}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 bg-teal-50/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{index}.</span>
        <div className="flex gap-1">
          <button
            onClick={() => {
              if (!draft.productName.trim()) return;
              onSave({ ...draft, id: draft.id || uid() });
            }}
            className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            <Check size={16} />
          </button>
          <button onClick={onCancelEdit} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
            <X size={16} />
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-500">Product Name</label>
        <input
          value={draft.productName}
          onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
          placeholder="Product name"
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Quantity</label>
          <input
            type="number"
            min={0}
            step="any"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: parseFloat(e.target.value) || 0 })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Unit</label>
          <select
            value={draft.unit}
            onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-500">Unit Price (؋)</label>
        <input
          type="number"
          min={0}
          step="any"
          value={draft.unitPrice}
          onChange={(e) => setDraft({ ...draft, unitPrice: parseFloat(e.target.value) || 0 })}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
        <span className="text-sm text-slate-500">Total</span>
        <span className="font-bold text-slate-900">{formatAFN(entryTotal(draft))}</span>
      </div>
      <div>
        <label className="text-xs text-slate-500">Notes</label>
        <input
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Optional"
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
