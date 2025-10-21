/**
 * Utilities for mapping between row indices, step indices, and calculating progress
 * Handles special logic for hems (folded sections, double-counted) and short rows
 */

export interface ProgressMapping {
  rowIndex: number;
  stepIndex: number;
  stepRowNumber: number; // Which row within the step (1-based)
  rowsInStep: number;
}

/**
 * Calculate step index from row index
 * Accounts for instructions where each step maps to a row range
 */
export function calculateStepFromRow(
  rowIndex: number,
  instructions: any[]
): number {
  if (!instructions || instructions.length === 0) return 0;

  let currentRowIndex = 0;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    const stepData = instruction?.stepData;
    
    if (!stepData) {
      // Single-row instruction (cast-on, bind-off, etc.)
      if (currentRowIndex === rowIndex) return i;
      currentRowIndex++;
    } else {
      // Multi-row step
      const startRow = stepData.startRowIndex ?? -1;
      const endRow = stepData.endRowIndex ?? -1;
      
      // Handle special instructions with no row index
      if (startRow === -1 || endRow === -1) {
        currentRowIndex++;
        continue;
      }

      if (rowIndex >= startRow && rowIndex <= endRow) {
        return i;
      }
      currentRowIndex += (endRow - startRow + 1);
    }
  }

  return Math.max(0, instructions.length - 1);
}

/**
 * Calculate detailed progress mapping from row index
 */
export function getProgressMapping(
  rowIndex: number,
  instructions: any[]
): ProgressMapping {
  const stepIndex = calculateStepFromRow(rowIndex, instructions);
  const instruction = instructions[stepIndex];
  const stepData = instruction?.stepData;

  let stepRowNumber = 1;
  let rowsInStep = 1;

  if (stepData) {
    const startRow = stepData.startRowIndex ?? -1;
    if (startRow !== -1) {
      stepRowNumber = Math.max(1, rowIndex - startRow + 1);
    }
    rowsInStep = stepData.rowsInStep ?? 1;
  }

  return {
    rowIndex,
    stepIndex,
    stepRowNumber,
    rowsInStep
  };
}

/**
 * Calculate how many rows to skip to move by N steps
 * Used for "next step" / "previous step" navigation
 */
export function calculateRowSkipForSteps(
  currentStepIndex: number,
  stepDelta: number, // +1 for next step, -1 for previous step
  instructions: any[]
): number {
  const targetStepIndex = Math.max(
    0,
    Math.min(instructions.length - 1, currentStepIndex + stepDelta)
  );

  if (targetStepIndex === currentStepIndex) return 0;

  let rowsToSkip = 0;

  if (stepDelta > 0) {
    // Moving forward
    for (let i = currentStepIndex; i < targetStepIndex; i++) {
      const stepData = instructions[i]?.stepData;
      if (stepData && stepData.rowsInStep) {
        rowsToSkip += stepData.rowsInStep;
      } else {
        rowsToSkip += 1;
      }
    }
  } else {
    // Moving backward
    for (let i = currentStepIndex - 1; i >= targetStepIndex; i--) {
      const stepData = instructions[i]?.stepData;
      if (stepData && stepData.rowsInStep) {
        rowsToSkip -= stepData.rowsInStep;
      } else {
        rowsToSkip -= 1;
      }
    }
  }

  return rowsToSkip;
}

/**
 * Calculate actual display progress considering hems and short rows
 * Hems and short rows are folded sections that should be displayed twice
 *
 * @param rowIndex Current row index in the stitch plan
 * @param stitchPlan The complete stitch plan with row metadata
 * @returns The display progress considering folds
 */
export function calculateDisplayProgress(
  rowIndex: number,
  stitchPlan: any
): {
  displayRowIndex: number;
  displayRowsTotal: number;
  isHemSection: boolean;
  isShortRowSection: boolean;
} {
  if (!stitchPlan?.rows || rowIndex >= stitchPlan.rows.length) {
    return {
      displayRowIndex: rowIndex,
      displayRowsTotal: stitchPlan?.rows?.length || 0,
      isHemSection: false,
      isShortRowSection: false
    };
  }

  const row = stitchPlan.rows[rowIndex];
  const isHemSection = row.isHem || false;
  const isShortRowSection = !!row.shortRowInfo;

  // For hemmed sections: count rows that belong to hem
  if (isHemSection) {
    let hemStartIndex = rowIndex;
    let hemEndIndex = rowIndex;

    // Find start of hem section
    for (let i = rowIndex - 1; i >= 0; i--) {
      if (stitchPlan.rows[i].isHem) {
        hemStartIndex = i;
      } else {
        break;
      }
    }

    // Find end of hem section
    for (let i = rowIndex + 1; i < stitchPlan.rows.length; i++) {
      if (stitchPlan.rows[i].isHem) {
        hemEndIndex = i;
      } else {
        break;
      }
    }

    const hemRowCount = hemEndIndex - hemStartIndex + 1;
    const hemRowOffset = rowIndex - hemStartIndex;

    // In folded hem, pass through twice
    return {
      displayRowIndex: hemRowOffset, // First pass
      displayRowsTotal: hemRowCount * 2, // Doubled for fold
      isHemSection: true,
      isShortRowSection: false
    };
  }

  // For short row sections: similar logic
  if (isShortRowSection) {
    const srInfo = row.shortRowInfo;
    let srStartIndex = rowIndex;
    let srEndIndex = rowIndex;

    // Find short row section boundaries
    for (let i = rowIndex - 1; i >= 0; i--) {
      if (
        stitchPlan.rows[i].shortRowInfo &&
        stitchPlan.rows[i].shortRowInfo.shortRowId === srInfo.shortRowId
      ) {
        srStartIndex = i;
      } else {
        break;
      }
    }

    for (let i = rowIndex + 1; i < stitchPlan.rows.length; i++) {
      if (
        stitchPlan.rows[i].shortRowInfo &&
        stitchPlan.rows[i].shortRowInfo.shortRowId === srInfo.shortRowId
      ) {
        srEndIndex = i;
      } else {
        break;
      }
    }

    const srRowCount = srEndIndex - srStartIndex + 1;
    const srRowOffset = rowIndex - srStartIndex;

    return {
      displayRowIndex: srRowOffset,
      displayRowsTotal: srRowCount * 2, // Doubled for fold effect
      isHemSection: false,
      isShortRowSection: true
    };
  }

  // Regular section
  return {
    displayRowIndex: rowIndex,
    displayRowsTotal: stitchPlan.rows.length,
    isHemSection: false,
    isShortRowSection: false
  };
}

/**
 * Format progress for display
 * @returns Human-readable progress string
 */
export function formatProgress(
  currentRowIndex: number,
  totalRows: number,
  isHem: boolean,
  isShortRow: boolean
): string {
  const passIndicator = isHem || isShortRow ? " (folded section)" : "";
  return `Row ${currentRowIndex + 1} of ${totalRows}${passIndicator}`;
}
