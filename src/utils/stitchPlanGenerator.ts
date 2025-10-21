/**
 * Utility to generate concrete stitch-by-stitch plans from abstract wizard data
 * This takes the complex panel shape, gauge, and colorwork layers and produces
 * a simple, concrete representation that the interactive knitting app can easily consume
 */

import { Panel } from '../models/Panel';
import { Trapezoid } from '../models/Trapezoid';
import { Gauge } from '../models/Gauge';
import { PanelColorworkComposer } from '../models/PanelColorworkComposer';
import { ColorworkPattern } from '../models/ColorworkPattern';
import { compressColorwork, decompressColorwork, ColorworkSegment } from './colorworkCompression';

/**
 * Short row information for a row that is part of a short row section
 */
export interface ShortRowInfo {
  shortRowId: string; // ID of the short row section this row belongs to
  shortRowLabel?: string;
  posX?: number; // Horizontal position (0-1) for distinguishing left/right short rows
  rowInShortRowSequence: number; // Which row within the short row sequence (1-based)
  totalRowsInShortRow: number; // Total rows in this short row sequence
  heldStitchesLeft: number; // Number of stitches held on left needle
  heldStitchesRight: number; // Number of stitches held on right needle
  activeStitchesLeft: number; // Number of stitches being worked on left
  activeStitchesRight: number; // Number of stitches being worked on right
}

/**
 * Concrete stitch data for a single row
 */
export interface StitchRow {
  rowNumber: number; // Machine row number (1-based)
  leftStitchesInWork: number;
  rightStitchesInWork: number;
  totalStitches: number;
  sectionLabel?: string; // Label of the shape section this row belongs to (e.g., "A", "B", "C")
  sectionStartRow?: number; // The first row number of this section
  sectionEndRow?: number; // The last row number of this section
  
  // Short row information - present if this row is part of a short row section
  shortRowInfo?: ShortRowInfo;
  
  // Colorwork data - can be stored in compressed or uncompressed format
  colorwork?: string[]; // LEGACY: Array of color IDs, one per stitch (uncompressed)
  colorworkCompressed?: ColorworkSegment[]; // NEW: Compressed format using RLE and repeats
}

/**
 * Concrete stitch plan - this is what gets saved to the project
 */
export interface ConcreteStitchPlan {
  rows: StitchRow[];
  colorPalette: { [colorId: string]: { color: string; label: string } };
  metadata: {
    totalRows: number;
    panelName: string;
    generatedAt: string;
  };
}

/**
 * Helper function to get colorwork array from a row (handles both compressed and uncompressed)
 */
export function getRowColorwork(row: StitchRow): string[] {
  if (row.colorworkCompressed) {
    return decompressColorwork(row.colorworkCompressed);
  }
  return row.colorwork || new Array(row.totalStitches).fill('MC');
}

/**
 * Generate a concrete stitch plan from panel shape and colorwork
 */
export function generateConcreteStitchPlan(
  shape: any, // Trapezoid shape data (can be plain object from JSON)
  gauge: any, // Gauge data
  colorworkLayers: any[], // Array of colorwork layers from wizard
  panelName: string,
  sizeModifier: number = 1.006 // Default to match Panel constructor
): ConcreteStitchPlan {
  try {
    // Reconstruct the Trapezoid from shape data
    const trapezoid = reconstructTrapezoid(shape);
    
    // Create Gauge instance
    const gaugeInstance = new Gauge(
      gauge.stitchesPerFourInches || gauge.stitchesPerInch * 4 || 20,
      gauge.rowsPerFourInches || gauge.rowsPerInch * 4 || 28,
      gauge.scaleFactor || gauge.scalingFactor || 1
    );
    
    // Create Panel with the sizeModifier
    const panel = new Panel(trapezoid, gaugeInstance, sizeModifier);
    
    // Generate the COMPLETE stitch plan including ALL successors
    // This is critical - we need to get every row in the entire shape tree!
    // Pass the sizeModifier to ensure gauge calculations match legacy Panel behavior
    const fullStitchPlan = generateCompleteStitchPlan(trapezoid, gaugeInstance, sizeModifier, 1);
    
    // If there are colorwork layers, combine them into a single pattern
    // We need to composite ALL layers together, not just use the first one
    let compositeColorwork: any[] = [];
    let allColors: { [colorId: string]: any } = {};
    
    if (colorworkLayers && colorworkLayers.length > 0) {
      // Start with a base array filled with main color
      const totalRows = fullStitchPlan.rows.length;
      compositeColorwork = fullStitchPlan.rows.map((row: any) => {
        return {
          rowNumber: row.rowNumber,
          totalStitches: row.leftStitchesInWork + row.rightStitchesInWork,
          colorwork: new Array(row.leftStitchesInWork + row.rightStitchesInWork).fill('MC')
        };
      });
      
      // Always include MC
      allColors['MC'] = { color: '#000000', label: 'MC' };
      
      // Process each layer in order (later layers override earlier ones)
      for (const layer of colorworkLayers) {
        if (!layer.pattern) continue;
        
        const colorworkPattern = reconstructColorworkPattern(layer.pattern);
        const composer = new PanelColorworkComposer();
        
        // Create a temporary panel for this layer to get colorwork mapping
        const tempPanel = new Panel(trapezoid, gaugeInstance);
        const combined = composer.combinePatterns(tempPanel, colorworkPattern);
        const layerStitchPlan = (combined as any).stitchPlan;
        
        // Merge colors from this layer
        if (colorworkPattern.colors) {
          Object.assign(allColors, colorworkPattern.colors);
        }
        
        // Apply this layer's colorwork to the composite
        if (layerStitchPlan.colorworkMapping && layerStitchPlan.colorworkMapping.mappedRows) {
          const mappedRows = layerStitchPlan.colorworkMapping.mappedRows;
          mappedRows.forEach((mappedRow: any, index: number) => {
            if (compositeColorwork[index] && mappedRow.colorwork) {
              // Overlay this layer's colorwork (non-transparent colors override)
              mappedRow.colorwork.forEach((color: string, stitchIndex: number) => {
                if (color !== 'CCX' && color !== 'transparent') {
                  compositeColorwork[index].colorwork[stitchIndex] = color;
                }
              });
            }
          });
        }
      }
    } else {
      // No colorwork - just use MC for everything
      compositeColorwork = fullStitchPlan.rows.map((row: any) => ({
        rowNumber: row.rowNumber,
        totalStitches: row.leftStitchesInWork + row.rightStitchesInWork,
        colorwork: new Array(row.leftStitchesInWork + row.rightStitchesInWork).fill('MC')
      }));
      allColors['MC'] = { color: '#000000', label: 'MC' };
    }
    
    // Convert to concrete format using the composite colorwork
    const rows: StitchRow[] = fullStitchPlan.rows.map((row: any, index: number) => {
      const totalStitches = row.leftStitchesInWork + row.rightStitchesInWork;
      
      // Get colorwork for this row from our composite
      let colorworkArray: string[] = compositeColorwork[index]?.colorwork || new Array(totalStitches).fill('MC');
      
      // Compress the colorwork data for storage efficiency
      const colorworkCompressed = compressColorwork(colorworkArray);
      
      return {
        rowNumber: row.rowNumber,
        leftStitchesInWork: row.leftStitchesInWork,
        rightStitchesInWork: row.rightStitchesInWork,
        totalStitches,
        colorworkCompressed, // Store compressed format
        // Preserve important metadata
        shortRowInfo: row.shortRowInfo, // CRITICAL: Preserve short row metadata!
        sectionLabel: row.sectionLabel, // Preserve section labels for grouping
        sectionStartRow: row.sectionStartRow,
        sectionEndRow: row.sectionEndRow
        // Note: 'colorwork' field is omitted - use getRowColorwork() to access
      };
    });
    
    // Extract color palette from all collected colors
    const colorPalette: { [colorId: string]: { color: string; label: string } } = {};
    Object.keys(allColors).forEach(colorId => {
      const colorData = allColors[colorId];
      colorPalette[colorId] = {
        color: colorData.color || '#000000',
        label: colorData.label || colorId
      };
    });
    
    // Always include MC (main color) if not already present
    if (!colorPalette['MC']) {
      colorPalette['MC'] = {
        color: '#ffffff',
        label: 'Main Color'
      };
    }
    
    return {
      rows,
      colorPalette,
      metadata: {
        totalRows: rows.length,
        panelName,
        generatedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error generating concrete stitch plan:', error);
    throw error;
  }
}

/**
 * Generate a complete stitch plan including ALL successors (children)
 * This recursively walks the shape tree to get every single row
 */
/**
 * Generate a complete stitch plan for a trapezoid and all successors
 * @param trapezoid - The Trapezoid shape
 * @param gauge - The Gauge instance
 * @param sizeModifier - The size modifier (default 1.006 to match Panel)
 * @param startRow - The starting row number
 */
function generateCompleteStitchPlan(trapezoid: Trapezoid, gauge: Gauge, sizeModifier: number, startRow: number): any {
  console.log('[generateCompleteStitchPlan] Processing trapezoid:', { 
    label: trapezoid.label, 
    height: trapezoid.height,
    hasShortRows: !!(trapezoid.shortRows && trapezoid.shortRows.length > 0),
    shortRowsCount: trapezoid.shortRows?.length || 0,
    shortRowsData: trapezoid.shortRows
  });
  
  // Get the stitch plan for this trapezoid with the correct sizeModifier
  const stitchPlan = trapezoid.getStitchPlan(gauge, sizeModifier, startRow);
  
  // Add section metadata to all rows of this trapezoid
  const sectionStartRow = startRow;
  const sectionEndRow = stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber : startRow - 1;
  
  for (const row of stitchPlan.rows) {
    row.sectionLabel = trapezoid.label || 'Unknown';
    row.sectionStartRow = sectionStartRow;
    row.sectionEndRow = sectionEndRow;
  }
  
  // Insert short rows into the main panel rows
  if (trapezoid.shortRows && trapezoid.shortRows.length > 0) {
    console.log('[generateCompleteStitchPlan] Calling integrateShortRows for section', trapezoid.label);
    stitchPlan.rows = integrateShortRows(stitchPlan.rows as any, trapezoid.shortRows, gauge, sizeModifier, trapezoid.height) as any;
  } else {
    console.log('[generateCompleteStitchPlan] No short rows for section', trapezoid.label);
  }
  
  // If this trapezoid has successors, recursively add their rows
  if (trapezoid.successors && trapezoid.successors.length > 0) {
    const lastRow = stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber : sectionEndRow;
    
    for (const successor of trapezoid.successors) {
      const successorPlan = generateCompleteStitchPlan(successor, gauge, sizeModifier, lastRow + 1);
      // Append all successor rows to our plan
      stitchPlan.rows.push(...successorPlan.rows);
    }
  }
  
  return stitchPlan;
}

/**
 * Integrate short rows into the main panel rows
 * Short rows are rows worked on a portion of stitches (with others held)
 * They are inserted at appropriate points within the section based on posY position
 * 
 * @param mainRows - The regular panel rows
 * @param shortRowDefs - Array of short row definitions from the trapezoid
 * @param gauge - The gauge instance
 * @param sizeModifier - Size modifier
 * @param sectionHeight - The DEFINED height of the section (in inches) - used to calculate correct row position
 * @returns Updated rows array with short rows interleaved
 */
function integrateShortRows(mainRows: StitchRow[], shortRowDefs: any[], gauge: Gauge, sizeModifier: number, sectionHeight?: number): StitchRow[] {
  if (!mainRows || mainRows.length === 0 || !shortRowDefs || shortRowDefs.length === 0) {
    console.log('[integrateShortRows] Skipping: mainRows=', mainRows?.length, 'shortRowDefs=', shortRowDefs?.length);
    return mainRows;
  }
  
  console.log('[integrateShortRows] Starting integration:', { mainRowsCount: mainRows.length, shortRowDefsCount: shortRowDefs.length, sectionHeight, trapezoidHeight: sectionHeight });
  console.log('[integrateShortRows] Short row definitions:', shortRowDefs.map(sr => ({ id: sr.id, posY: sr.posY, height: sr.height })));
  
  const result: StitchRow[] = [];
  const rowsPerInch = gauge.getRowsPerInch() * sizeModifier;
  console.log('[integrateShortRows] Gauge info:', { rowsPerInch, gaugeRowsPerInch: gauge.getRowsPerInch(), sizeModifier });
  
  // Calculate the correct row position based on section height, not total rows
  // If sectionHeight is provided, use it to calculate posY accurately
  // Otherwise fall back to using mainRows.length
  const referenceRowCount = sectionHeight ? Math.round(sectionHeight * rowsPerInch) : mainRows.length;
  console.log('[integrateShortRows] Reference row count calculation:', { sectionHeight, rowsPerInch, referenceRowCount, mainRowsLength: mainRows.length });
  
  // Sort short rows by posY so they appear in order
  const sortedShortRows = [...shortRowDefs]
    .map(sr => ({ 
      ...sr, 
      insertAfterRowIndex: Math.floor((sr.posY || 0.5) * (referenceRowCount - 1)),
      calculatedRowNumber: Math.floor((sr.posY || 0.5) * referenceRowCount)
    }))
    .sort((a, b) => a.insertAfterRowIndex - b.insertAfterRowIndex);
  
  console.log('[integrateShortRows] Sorted short rows with positions:', sortedShortRows.map(sr => ({ 
    id: sr.id, 
    posY: sr.posY,
    referenceRowCount,
    mainRowsLength: mainRows.length,
    insertAfterRowIndex: sr.insertAfterRowIndex,
    calculatedRowNumber: sr.calculatedRowNumber
  })));
  
  let shortRowInsertIndex = 0;
  let nextRowNumber = mainRows[0]?.rowNumber || 1;
  
  for (let i = 0; i < mainRows.length; i++) {
    result.push(mainRows[i]);
    nextRowNumber = mainRows[i].rowNumber + 1;
    
    // Check if we should insert short rows after this main row
    while (shortRowInsertIndex < sortedShortRows.length && sortedShortRows[shortRowInsertIndex].insertAfterRowIndex === i) {
      const shortRowDef = sortedShortRows[shortRowInsertIndex];
      const shortRowHeight = shortRowDef.height || 0;
      const shortRowRowsCount = Math.max(1, Math.round(shortRowHeight * rowsPerInch));
      
      console.log(`[integrateShortRows] Inserting short row after main row ${i}:`, { id: shortRowDef.id, height: shortRowHeight, rowsCount: shortRowRowsCount });
      
      const baseStart = shortRowDef.baseStart || 0;
      const basePivot = shortRowDef.basePivot || 0;
      
      // Generate the short row rows
      for (let srIndex = 1; srIndex <= shortRowRowsCount; srIndex++) {
        const shortRow: StitchRow = {
          rowNumber: nextRowNumber++,
          // In a short row, only a portion of stitches are in work
          leftStitchesInWork: Math.round(basePivot * gauge.getStitchesPerInch() * sizeModifier),
          rightStitchesInWork: Math.round((baseStart - basePivot) * gauge.getStitchesPerInch() * sizeModifier),
          totalStitches: Math.round(baseStart * gauge.getStitchesPerInch() * sizeModifier),
          sectionLabel: mainRows[i].sectionLabel,
          sectionStartRow: mainRows[i].sectionStartRow,
          sectionEndRow: mainRows[i].sectionEndRow,
          shortRowInfo: {
            shortRowId: shortRowDef.id || `sr-${nextRowNumber}`,
            shortRowLabel: shortRowDef.label,
            posX: shortRowDef.posX, // Store horizontal position
            rowInShortRowSequence: srIndex,
            totalRowsInShortRow: shortRowRowsCount,
            heldStitchesLeft: Math.round((baseStart - basePivot) * gauge.getStitchesPerInch() * sizeModifier),
            heldStitchesRight: Math.round(basePivot * gauge.getStitchesPerInch() * sizeModifier),
            activeStitchesLeft: Math.round(basePivot * gauge.getStitchesPerInch() * sizeModifier),
            activeStitchesRight: Math.round((baseStart - basePivot) * gauge.getStitchesPerInch() * sizeModifier)
          }
        };
        
        result.push(shortRow);
      }
      
      shortRowInsertIndex++;
    }
  }
  
  console.log('[integrateShortRows] Final result:', { originalCount: mainRows.length, finalCount: result.length, shortRowsAdded: result.length - mainRows.length });
  
  return result;
}

/**
 * Reconstruct a Trapezoid instance from plain object data
 */
function reconstructTrapezoid(shapeData: any): Trapezoid {
  if (!shapeData) {
    throw new Error('No shape data provided');
  }
  
  // Recursively reconstruct successors
  const successors = (shapeData.successors || []).map((s: any) => reconstructTrapezoid(s));
  
  const trapezoid = new Trapezoid(
    shapeData.height || 0,
    shapeData.baseA || 0,
    shapeData.baseB || 0,
    shapeData.baseBHorizontalOffset || 0,
    successors,
    shapeData.finishingSteps || [],
    shapeData.modificationScale || 1,
    shapeData.label || null
  );
  
  // Preserve shortRows and isHem properties
  trapezoid.shortRows = Array.isArray(shapeData.shortRows) ? shapeData.shortRows : [];
  trapezoid.isHem = !!shapeData.isHem;
  
  return trapezoid;
}

/**
 * Reconstruct a ColorworkPattern instance from plain object data
 */
function reconstructColorworkPattern(patternData: any): ColorworkPattern {
  if (!patternData) {
    return new ColorworkPattern(10, 10); // Default empty pattern
  }
  
  if (patternData instanceof ColorworkPattern) {
    return patternData;
  }
  
  return new ColorworkPattern(
    patternData.width || (patternData.grid && patternData.grid[0] ? patternData.grid[0].length : 10),
    patternData.height || (patternData.grid ? patternData.grid.length : 10),
    patternData.grid || [],
    patternData.colors || patternData.colorPalette || {},
    patternData.metadata || {}
  );
}

/**
 * Validate that a concrete stitch plan is well-formed
 */
export function validateConcreteStitchPlan(plan: ConcreteStitchPlan): boolean {
  if (!plan.rows || plan.rows.length === 0) {
    console.warn('Stitch plan has no rows');
    return false;
  }
  
  for (const row of plan.rows) {
    // Get colorwork (handles both compressed and uncompressed)
    const colorwork = getRowColorwork(row);
    
    if (!colorwork || colorwork.length !== row.totalStitches) {
      console.warn(`Row ${row.rowNumber}: colorwork array length (${colorwork?.length}) doesn't match total stitches (${row.totalStitches})`);
      return false;
    }
  }
  
  return true;
}
