/**
 * Type definitions for Pattern Wizard components
 */

import { Trapezoid } from '../../../models/Trapezoid';
import { Gauge } from '../../../models/Gauge';
import { ColorworkPattern } from '../../../models/ColorworkPattern';

/**
 * Panel metadata from library or garment
 */
export interface PanelMetadata {
  key: string;
  garmentTitle: string;
  garmentPermalink: string;
  panelName: string;
}

/**
 * A specific instance of a panel (e.g., "Front Panel #1", "Front Panel #2")
 */
export interface PanelInstance {
  key: string; // Original panel key (e.g., "garment::panelName")
  instanceId: string; // Unique instance identifier (e.g., "garment::panelName::instance-1")
  panelName: string; // Display name (e.g., "Front Panel #1")
  isColored?: boolean; // Whether colorwork has been applied
}

/**
 * Panel shape configuration
 */
export interface PanelConfig {
  shape: Trapezoid | null;
  gauge: Gauge;
  sizeModifier: number;
}

/**
 * Colorwork pattern layer
 */
export interface ColorworkLayer {
  id: string | number;
  name: string;
  pattern: ColorworkPattern;
  patternType: string;
  patternConfig?: any;
  priority?: number;
  settings?: {
    stretchMode?: string;
    alignmentMode?: string;
    [key: string]: any;
  };
}

/**
 * Colorwork state for a panel instance
 */
export interface PanelColorworkState {
  instanceId: string;
  layers: ColorworkLayer[];
  timestamp?: number;
}

/**
 * Panel dimensions in stitches and inches
 */
export interface PanelDimensions {
  widthInches: number;
  heightInches: number;
  totalStitches: number;
  totalRows: number;
}

/**
 * Props for PanelCard component
 */
export interface PanelCardProps {
  panelKey: string;
  panelName: string;
  quantity: number;
  shape: Trapezoid | null;
  dimensions?: PanelDimensions | null;
  isExpanded: boolean;
  completedInstances: number;
  totalInstances: number;
  onQuantityChange: (quantity: number) => void;
  onEditColorwork: () => void;
  onExpandToggle: () => void;
}

/**
 * Props for PanelInstanceList component
 */
export interface PanelInstanceListProps {
  instances: PanelInstance[];
  currentIndex: number;
  coloredInstances: Set<string>;
  onSelectInstance: (index: number) => void;
  onCopyColorwork: (sourceInstanceId: string, targetInstanceId: string) => void;
}

/**
 * Props for ColorworkEditorSection component
 */
export interface ColorworkEditorSectionProps {
  currentInstance: PanelInstance | null;
  panelConfig: PanelConfig;
  allInstances: PanelInstance[];
  coloredInstances: Set<string>;
  onSave: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Props for PanelSummary component
 */
export interface PanelSummaryProps {
  totalPanelTypes: number;
  totalInstances: number;
  completedInstances: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

/**
 * Gauge information from Redux store
 */
export interface WizardGauge {
  stitchesPerInch?: number;
  rowsPerInch?: number;
  stitchesPerFourInches?: number;
  rowsPerFourInches?: number;
  scaleFactor?: number;
}

/**
 * Panel counts by panel key
 */
export type PanelCounts = Record<string, number>;

/**
 * Copy colorwork action payload
 */
export interface CopyColorworkPayload {
  sourcePanelKey: string;
  targetPanelKey: string;
}
