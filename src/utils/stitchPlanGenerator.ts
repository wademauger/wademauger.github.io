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
 * Concrete stitch data for a single row
 */
export interface StitchRow {
  rowNumber: number; // Machine row number (1-based)
  leftStitchesInWork: number;
  rightStitchesInWork: number;
  totalStitches: number;
  
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
  panelName: string
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
    
    // Create Panel
    const panel = new Panel(trapezoid, gaugeInstance);
    
    // Generate the COMPLETE stitch plan including ALL successors
    // This is critical - we need to get every row in the entire shape tree!
    const fullStitchPlan = generateCompleteStitchPlan(trapezoid, gaugeInstance, 1);
    
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
        colorworkCompressed // Store compressed format
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
function generateCompleteStitchPlan(trapezoid: Trapezoid, gauge: Gauge, startRow: number): any {
  // Get the stitch plan for this trapezoid
  const stitchPlan = trapezoid.getStitchPlan(gauge, 1, startRow);
  
  // If this trapezoid has successors, recursively add their rows
  if (trapezoid.successors && trapezoid.successors.length > 0) {
    const lastRow = stitchPlan.rows.length > 0 ? stitchPlan.rows[stitchPlan.rows.length - 1].rowNumber : startRow - 1;
    
    for (const successor of trapezoid.successors) {
      const successorPlan = generateCompleteStitchPlan(successor, gauge, lastRow + 1);
      // Append all successor rows to our plan
      stitchPlan.rows.push(...successorPlan.rows);
    }
  }
  
  return stitchPlan;
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
  
  return new Trapezoid(
    shapeData.height || 0,
    shapeData.baseA || 0,
    shapeData.baseB || 0,
    shapeData.baseBHorizontalOffset || 0,
    successors,
    shapeData.finishingSteps || [],
    shapeData.modificationScale || 1,
    shapeData.label || null
  );
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
