import { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Trash2, Check } from 'lucide-react';
import { AppData, EMPTY_DATA } from '@/lib/types';
import { exportData, importData } from '@/lib/storage';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export function SettingsPanel({ data, setData }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const recordCount = Object.keys(data.records).length;
  const productCount = data.products.length;

  function handleExport() {
    exportData(data);
    setMessage({ type: 'success', text: 'Backup file downloaded successfully.' });
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importData(file);
      if (confirm('This will replace all current data with the backup. Continue?')) {
        setData(() => imported);
        setMessage({ type: 'success', text: 'Data restored from backup successfully.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to restore data.' });
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClearAll() {
    if (!confirm('Delete ALL records and products? This cannot be undone. Consider exporting a backup first.')) return;
    setData(() => ({ ...EMPTY_DATA }));
    setMessage({ type: 'success', text: 'All data cleared.' });
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-2xl font-bold text-teal-700">{recordCount}</p>
          <p className="text-xs text-slate-500 mt-1">Days recorded</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-2xl font-bold text-teal-700">{productCount}</p>
          <p className="text-xs text-slate-500 mt-1">Saved products</p>
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">Backup & Restore</h3>
        <p className="text-sm text-slate-500">
          Export your data to a file for safekeeping, or restore from a previous backup.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExport}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Download size={16} /> Export backup
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Upload size={16} /> Restore from file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
        </div>
        {message && (
          <div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {message.text}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 space-y-3">
        <h3 className="font-semibold text-red-700">Danger Zone</h3>
        <p className="text-sm text-slate-500">
          Permanently delete all records and products from this device.
        </p>
        <button
          onClick={handleClearAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} /> Delete all data
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center px-4">
        All data is stored locally on this device and works offline. Export regularly to avoid losing records.
      </p>
    </div>
  );
}
