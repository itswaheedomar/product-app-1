export interface Product {
  id: string;
  name: string;
  unit: string;
  defaultPrice: number;
}

export interface RecordEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  entries: RecordEntry[];
}

export interface AppData {
  products: Product[];
  records: Record<string, DayRecord>;
}

export const EMPTY_DATA: AppData = {
  products: [],
  records: {},
};

export const COMMON_UNITS = [
  'کیلو',
  'گرام',
  'پایه',
  'دست',
  'بسته',
  'لیتر',
  'میتر',
  'عدد',
  'جعبه',
  'تن',
];

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(key: string): string {
  const d = parseDateKey(key);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatMonthYear(key: string): string {
  const d = parseDateKey(key);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatAFN(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `؋ ${rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function entryTotal(e: RecordEntry): number {
  return (e.quantity || 0) * (e.unitPrice || 0);
}

export function dayTotal(day: DayRecord | undefined): number {
  if (!day) return 0;
  return day.entries.reduce((sum, e) => sum + entryTotal(e), 0);
}
