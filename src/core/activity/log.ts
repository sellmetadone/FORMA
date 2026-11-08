/** Local activity log for Settings / diagnostics */

export type ActivityEntry = {
  id: string;
  at: string;
  action: string;
  detail?: string;
};

const KEY = 'forma.activityLog';
const MAX = 200;

export function getActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

export function logActivity(action: string, detail?: string) {
  const list = getActivityLog();
  list.unshift({
    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    action,
    detail,
  });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function clearActivityLog() {
  localStorage.removeItem(KEY);
}
