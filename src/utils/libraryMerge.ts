// Simple library merge helper used by PanelShapeCreator
export function mergePanelIntoLibrary(library: any, panelName: string, panelPayload: any): any {
  const lib = (library && typeof library === 'object') ? { ...library } : {};
  lib.panels = lib.panels && typeof lib.panels === 'object' ? { ...lib.panels } : {};
  lib.panels[panelName] = panelPayload;
  lib.lastUpdated = new Date().toISOString();
  return lib;
}

export default mergePanelIntoLibrary;
