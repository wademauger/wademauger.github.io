// Merge helper for colorwork patterns
export function mergeColorworkIntoLibrary(library, patternPayload) {
  const lib = (library && typeof library === 'object') ? { ...library } : {};
  lib.colorworkPatterns = Array.isArray(lib.colorworkPatterns) ? [...lib.colorworkPatterns] : [];

  // Replace existing by id or name if present
  const idxById = patternPayload && patternPayload.id ? lib.colorworkPatterns.findIndex((p: any) => p.id === patternPayload.id) : -1;
  const idxByName = patternPayload && patternPayload.name ? lib.colorworkPatterns.findIndex((p: any) => p.name === patternPayload.name) : -1;

  if (idxById !== -1) {
    lib.colorworkPatterns[idxById] = patternPayload;
  } else if (idxByName !== -1) {
    lib.colorworkPatterns[idxByName] = patternPayload;
  } else {
    lib.colorworkPatterns.push(patternPayload);
  }

  lib.lastUpdated = new Date().toISOString();
  return lib;
}

export default mergeColorworkIntoLibrary;
