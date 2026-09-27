import { AppData, EMPTY_DATA } from './types';

const STORAGE_KEY = 'afghan-records-data-v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_DATA };
    const parsed = JSON.parse(raw) as AppData;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
    };
  } catch {
    return { ...EMPTY_DATA };
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `afghan-records-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as AppData;
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file');
        resolve({
          products: Array.isArray(parsed.products) ? parsed.products : [],
          records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
        });
      } catch {
        reject(new Error('Could not read this file. Please select a valid backup file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
