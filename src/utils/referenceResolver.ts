import { detectLegacyFormat, migrateLegacyToNamespaced } from './libraryFormat';

interface ResolveOptions {
  fileId?: string | null;
  namespace: string;
  entryId: string;
  loader?: (fileId: string) => Promise<any>;
  libraryObj?: any;
  cache?: Map<string, any>;
}

// resolveEntryReference accepts an async loader: async function loadLibraryById(fileId) -> libraryObj
// If fileId is null, the libraryObj parameter is expected instead.
async function resolveEntryReference({ fileId, namespace, entryId, loader, libraryObj, cache }: ResolveOptions): Promise<{ entry: any; library: any }> {
  cache = cache || new Map();
  let lib = null;
  if (fileId) {
    if (cache.has(fileId)) lib = cache.get(fileId);
    else {
      if (!loader) throw new Error('Loader required when fileId is provided');
      lib = await loader(fileId);
      if (!lib) throw new Error(`Library ${fileId} not found`);
      // migrate if needed
      const legacy = detectLegacyFormat(lib);
      if (legacy.isLegacy) lib = migrateLegacyToNamespaced(lib, legacy.inferredNamespace || 'panels');
      cache.set(fileId, lib);
    }
  } else if (libraryObj) {
    lib = libraryObj;
    const legacy = detectLegacyFormat(lib);
    if (legacy.isLegacy) lib = migrateLegacyToNamespaced(lib, legacy.inferredNamespace || 'panels');
  } else {
    throw new Error('Either fileId or libraryObj must be provided');
  }

  const ns = (lib.namespaces && lib.namespaces[namespace]) || (lib[namespace]) || [];
  if (!Array.isArray(ns)) throw new Error(`Namespace ${namespace} not found or invalid`);
  const entry = ns.find((e: any) => e && (e.id === entryId || e.name === entryId));
  if (!entry) throw new Error(`Entry ${entryId} not found in ${namespace}`);
  return { entry, library: lib };
}

interface ResolveAllOptions {
  loader?: (fileId: string) => Promise<any>;
  cache?: Map<string, any>;
}

async function resolveAllRefs(entry: any, options: ResolveAllOptions = {}): Promise<Record<string, any[]>> {
  // options: loader, cache
  const loader = options.loader;
  const cache = options.cache || new Map();
  const resolved: Record<string, any[]> = {};
  if (!entry || !entry.refs || !Array.isArray(entry.refs)) return resolved;
  for (const r of entry.refs) {
    try {
      const fileId = r.fileId || null;
      const namespace = r.namespace;
      const entryId = r.entryId;
      const res = await resolveEntryReference({ fileId, namespace, entryId, loader, cache });
      if (!resolved[namespace]) resolved[namespace] = [];
      resolved[namespace].push(res.entry);
    } catch (err: unknown) {
      // attach placeholder error entry
      if (!resolved[r.namespace]) resolved[r.namespace] = [];
      const errorMessage = err instanceof Error ? err.message : String(err);
      resolved[r.namespace].push({ id: r.entryId, __missing: true, __error: errorMessage });
    }
  }
  return resolved;
}

export { resolveEntryReference, resolveAllRefs };
