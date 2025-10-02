const callbacks = new Map();

function genId() {
  return `cb-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

export function registerCallback(fn) {
  const id = genId();
  callbacks.set(id, fn);
  // Debug log for callback registration
  try {
    console.log(`modalCallbackRegistry: registerCallback -> ${id}`);
  } catch {
    // Ignore logging errors
  }
  return id;
}

export function getCallback(id) {
  const cb = callbacks.get(id);
  try {
    console.log(`modalCallbackRegistry: getCallback -> ${id} -> ${cb ? 'FOUND' : 'MISSING'}`);
  } catch {
    // Ignore logging errors
  }
  return cb;
}

export function removeCallback(id) {
  const existed = callbacks.delete(id);
  try {
    console.log(`modalCallbackRegistry: removeCallback -> ${id} -> ${existed ? 'REMOVED' : 'NOT_FOUND'}`);
  } catch {
    // Ignore logging errors
  }
}

// For debugging
export function listCallbacks() {
  return Array.from(callbacks.keys());
}

export default {
  registerCallback,
  getCallback,
  removeCallback,
  listCallbacks
};
