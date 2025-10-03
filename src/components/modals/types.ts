/**
 * Shared types for the reusable modal system
 */

export interface LibrarySettings {
  fileName: string;
  folderPath: string;
}

export interface LibrarySettingsModalProps {
  visible: boolean;
  jsonKey: string; // e.g., 'panels', 'songs', 'recipes'
  displayLabel: string; // e.g., 'Panel', 'Song', 'Recipe'
  onClose: () => void;
  onSave?: (settings: LibrarySettings) => void;
}

export interface SaveAsModalProps<T = any> {
  visible: boolean;
  jsonKey: string; // e.g., 'panels', 'songs', 'recipes'
  displayLabel: string; // e.g., 'Panel', 'Song', 'Recipe'
  entityData: T; // The data to save
  onSave: (name: string, entity: T) => Promise<void>;
  onClose: () => void;
}

export interface OpenModalProps<T = any> {
  visible: boolean;
  jsonKey: string; // e.g., 'panels', 'songs', 'recipes'
  displayLabel: string; // e.g., 'Panel', 'Song', 'Recipe'
  onOpen: (entity: T) => void;
  onClose: () => void;
}

export interface LibraryEntity {
  id?: string;
  name: string;
  [key: string]: any;
}
