import {
  DEFAULT_SETTINGS,
  type OrderMode,
  type SessionState,
  type Settings,
} from "@/lib/types";

const SETTINGS_KEY = "ish-aws:settings";
const SESSION_KEY = "ish-aws:session";

const VALID_ORDERS: OrderMode[] = ["random", "first", "last"];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const merged: Settings = { ...DEFAULT_SETTINGS, ...parsed };
    // Migrate any stale OrderMode (e.g. the retired "middle") back to the default.
    if (!VALID_ORDERS.includes(merged.order)) {
      merged.order = DEFAULT_SETTINGS.order;
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignored — quota or private mode */
  }
}

export function loadSession(): SessionState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSession(session: SessionState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignored */
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignored */
  }
}
