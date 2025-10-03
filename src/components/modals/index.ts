/**
 * Reusable Modal System
 * 
 * This module provides a set of reusable modals for managing library entities
 * across different apps (songs, recipes, panels, etc.)
 */

export { LibrarySettingsModal } from './LibrarySettingsModal';
export { OpenModal } from './OpenModal';
export { SaveAsModal } from './SaveAsModal';

export type {
  LibrarySettings,
  LibrarySettingsModalProps,
  SaveAsModalProps,
  OpenModalProps,
  LibraryEntity
} from './types';
