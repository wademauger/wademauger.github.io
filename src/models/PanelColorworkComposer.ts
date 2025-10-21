import { ColorworkPattern } from './ColorworkPattern';
import { Panel } from './Panel';
import { CombinedPattern } from './CombinedPattern';

export class PanelColorworkComposer {
  defaultStretchMode: string;
  defaultAlignmentMode: string;

  constructor() {
    this.defaultStretchMode = 'repeat';
    this.defaultAlignmentMode = 'center';
  }

  combinePatterns(panel: Panel, colorworkPattern: ColorworkPattern, options: any = {}) {
    const { stretchMode = this.defaultStretchMode, alignmentMode = this.defaultAlignmentMode } = options;

    const stitchPlan = this.generatePanelStitchPlan(panel);

    const mappedPattern = this.mapColorworkToShape(stitchPlan, colorworkPattern, {
      stretchMode,
      alignmentMode,
    });

    const combined = new CombinedPattern(panel, colorworkPattern, mappedPattern || [], stitchPlan);

    if (stitchPlan && typeof stitchPlan.setColorworkMapping === 'function') {
      stitchPlan.setColorworkMapping(combined);
    }

    if (mappedPattern && stitchPlan && stitchPlan.rows) {
      mappedPattern.forEach((mappedRow: any, index: number) => {
        if (stitchPlan.rows[index] && typeof stitchPlan.rows[index].setColorwork === 'function') {
          stitchPlan.rows[index].setColorwork(mappedRow.colorwork, combined.colorworkPattern);
        }
      });
    }

    return combined;
  }

  generatePanelStitchPlan(panel: Panel) {
    if (!panel || !panel.shape) return { rows: [] } as any;
    const gauge = panel.gauge;
    const sizeModifier = panel.sizeModifier;
    return (panel.shape as any).getStitchPlan(gauge, sizeModifier, 1);
  }

  mapColorworkToShape(stitchPlan: any, colorworkPattern: ColorworkPattern, options: any = {}) {
    const { stretchMode } = options;
    const mappedRows: any[] = [];

    if (!stitchPlan || !stitchPlan.rows || stitchPlan.rows.length === 0) return mappedRows;

    const patternHeight = colorworkPattern ? colorworkPattern.getRowCount() : 0;

    for (let i = 0; i < stitchPlan.rows.length; i++) {
      const stitchRow = stitchPlan.rows[i];
      const totalStitches = stitchRow.leftStitchesInWork + stitchRow.rightStitchesInWork;
      const colorworkRowIndex = this.mapRowIndex(i, stitchPlan.rows.length, patternHeight, stretchMode);

      const mappedRow = this.mapRowStitches(
        colorworkPattern,
        colorworkRowIndex,
        totalStitches,
        stitchRow.leftStitchesInWork,
        { stretchMode }
      );

      mappedRows.push({
        panelRow: i + 1,
        machineRow: stitchRow.rowNumber,
        leftStitches: stitchRow.leftStitchesInWork,
        rightStitches: stitchRow.rightStitchesInWork,
        totalStitches,
        colorwork: mappedRow,
        colorworkRowIndex,
      });
    }

    return mappedRows;
  }

  mapRowIndex(panelRowIndex: number, totalPanelRows: number, colorworkRows: number, stretchMode: string) {
    if (!colorworkRows || colorworkRows === 0) return 0;
    let mappedIndex: number;
    switch (stretchMode) {
      case 'stretch':
        mappedIndex = Math.floor((panelRowIndex * colorworkRows) / totalPanelRows);
        break;
      case 'repeat':
        mappedIndex = panelRowIndex % colorworkRows;
        break;
      case 'center': {
        const startOffset = Math.floor((totalPanelRows - colorworkRows) / 2);
        if (panelRowIndex < startOffset || panelRowIndex >= startOffset + colorworkRows) return -1;
        mappedIndex = panelRowIndex - startOffset;
        break;
      }
      default:
        mappedIndex = panelRowIndex % colorworkRows;
    }
    return colorworkRows - 1 - mappedIndex;
  }

  mapRowStitches(
    colorworkPattern: ColorworkPattern,
    colorworkRowIndex: number,
    totalStitches: number,
    leftStitches: number,
    options: any = {}
  ) {
    const { stretchMode } = options;
    if (!colorworkPattern || colorworkRowIndex < 0 || colorworkRowIndex >= colorworkPattern.getRowCount())
      return Array(totalStitches).fill('MC');

    const patternRow = colorworkPattern.grid[colorworkRowIndex] || [];
    const patternWidth = patternRow.length || 0;
    const mappedStitches: any[] = [];

    for (let stitchIndex = 0; stitchIndex < totalStitches; stitchIndex++) {
      let patternStitchIndex: number;
      switch (stretchMode) {
        case 'stretch':
          patternStitchIndex = Math.floor((stitchIndex * patternWidth) / totalStitches);
          break;
        case 'repeat':
          patternStitchIndex = patternWidth > 0 ? stitchIndex % patternWidth : 0;
          break;
        case 'center': {
          const startOffset = Math.floor((totalStitches - patternWidth) / 2);
          if (stitchIndex < startOffset || stitchIndex >= startOffset + patternWidth) {
            mappedStitches.push('MC');
            continue;
          }
          patternStitchIndex = stitchIndex - startOffset;
          break;
        }
        default:
          patternStitchIndex = patternWidth > 0 ? stitchIndex % patternWidth : 0;
      }

      const color = patternRow[patternStitchIndex] || 'MC';
      mappedStitches.push(color);
    }

    return mappedStitches;
  }
}
