/**
 * LabTrack Offline Cache & Sincronizacion Local
 * Regla Inquebrantable #14: Invariante Anti-Siembras Fantasma
 */
const PURGE_FLAG = 'labtrack_demo_purged';
const STORAGE_KEY_ORDERS = 'labtrack_orders_v1';
const STORAGE_KEY_PROTOCOLS = 'labtrack_protocols_v1';
const STORAGE_KEY_REFERRALS = 'labtrack_referrals_v1';
const STORAGE_KEY_OUTBOX = 'labtrack_outbox_v1';

// In-memory fallback for non-browser/test environments
const memoryStore = new Map();

function getStorageItem(key) {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key, val) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, val);
  } else {
    memoryStore.set(key, val);
  }
}

function removeStorageItem(key) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  } else {
    memoryStore.delete(key);
  }
}

function safeParseArray(raw, label) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    throw new Error(`Datos locales corruptos en ${label}: ${err.message}`);
  }
}

export class LabTrackCacheService {
  static isPurged() {
    return getStorageItem(PURGE_FLAG) === 'true';
  }

  static purgeData() {
    setStorageItem(PURGE_FLAG, 'true');
    removeStorageItem(STORAGE_KEY_ORDERS);
    removeStorageItem(STORAGE_KEY_PROTOCOLS);
    removeStorageItem(STORAGE_KEY_REFERRALS);
    removeStorageItem(STORAGE_KEY_OUTBOX);
  }

  static resetPurgeForTesting() {
    removeStorageItem(PURGE_FLAG);
  }

  static saveOrders(orders = []) {
    try {
      setStorageItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (err) {
      throw new Error(`No se pudieron guardar las muestras en cache local: ${err.message}`);
    }
  }

  static getOrders() {
    if (this.isPurged()) return [];
    const raw = getStorageItem(STORAGE_KEY_ORDERS);
    return safeParseArray(raw, 'muestras');
  }

  static saveProtocols(protocols = []) {
    try {
      setStorageItem(STORAGE_KEY_PROTOCOLS, JSON.stringify(protocols));
    } catch (err) {
      throw new Error(`No se pudieron guardar los protocolos en cache local: ${err.message}`);
    }
  }

  static getProtocols() {
    if (this.isPurged()) return [];
    const raw = getStorageItem(STORAGE_KEY_PROTOCOLS);
    return safeParseArray(raw, 'protocolos');
  }

  static saveReferrals(referrals = []) {
    try {
      setStorageItem(STORAGE_KEY_REFERRALS, JSON.stringify(referrals));
    } catch (err) {
      throw new Error(`No se pudieron guardar las derivaciones en cache local: ${err.message}`);
    }
  }

  static getReferrals() {
    if (this.isPurged()) return [];
    const raw = getStorageItem(STORAGE_KEY_REFERRALS);
    return safeParseArray(raw, 'derivaciones');
  }

  static enqueueOutbox(action) {
    const raw = getStorageItem(STORAGE_KEY_OUTBOX);
    const queue = safeParseArray(raw, 'cola de salida');
    queue.push({
      id: `OUT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      enqueuedAt: new Date().toISOString()
    });
    setStorageItem(STORAGE_KEY_OUTBOX, JSON.stringify(queue));
  }

  static getOutbox() {
    const raw = getStorageItem(STORAGE_KEY_OUTBOX);
    return safeParseArray(raw, 'cola de salida');
  }

  static clearOutbox() {
    removeStorageItem(STORAGE_KEY_OUTBOX);
  }
}
