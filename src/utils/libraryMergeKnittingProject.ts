// Merge helper for knitting projects
export function mergeKnittingProjectIntoLibrary(library: any, projectPayload: any) {
  const lib = (library && typeof library === 'object') ? { ...library } : {};
  lib.knittingProjects = Array.isArray(lib.knittingProjects) ? [...lib.knittingProjects] : [];

  // Replace existing by id or name if present
  const idxById = projectPayload && projectPayload.id ? lib.knittingProjects.findIndex((p: any) => p.id === projectPayload.id) : -1;
  const idxByName = projectPayload && projectPayload.name ? lib.knittingProjects.findIndex((p: any) => p.name === projectPayload.name) : -1;

  if (idxById !== -1) {
    lib.knittingProjects[idxById] = projectPayload;
  } else if (idxByName !== -1) {
    lib.knittingProjects[idxByName] = projectPayload;
  } else {
    lib.knittingProjects.push(projectPayload);
  }

  lib.lastUpdated = new Date().toISOString();
  return lib;
}

export default mergeKnittingProjectIntoLibrary;