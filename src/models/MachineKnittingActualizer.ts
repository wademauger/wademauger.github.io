import KnittingInstructionActualizer, { StitchRow, KnittingInstruction } from './KnittingInstructionActualizer';

/**
 * MachineKnittingActualizer - Generates instructions tailored to knitting machines
 *
 * Supports different machine types via knittingOptions.machineType and
 * bed sizes / needle pitches via knittingOptions.maxNeedlesPerSide and knittingOptions.needlePitch.
 */
export class MachineKnittingActualizer extends KnittingInstructionActualizer {
    constructor(knittingOptions: any = {}) {
        super(knittingOptions);
        // If machineType is recognized, set sensible defaults
        if (knittingOptions && knittingOptions.machineType === 'sl1') {
            this.maxNeedlesPerSide = knittingOptions.maxNeedlesPerSide || 100;
        }
        // needlePitch can be used by higher-level instruction text; stored on knittingOptions
    }

    actualize(sectionRows: StitchRow[], baseRowIndex: number): KnittingInstruction[] {
        const instructions: KnittingInstruction[] = [];

        if (!Array.isArray(sectionRows) || sectionRows.length === 0) return instructions;

        let i = 0;
        while (i < sectionRows.length) {
            const row = sectionRows[i];

            if (row.shortRowInfo) {
                // Group all rows with the same shortRowId
                const srId = row.shortRowInfo.shortRowId;
                const groupRows: StitchRow[] = [];
                let j = i;
                while (j < sectionRows.length && sectionRows[j].shortRowInfo && sectionRows[j].shortRowInfo?.shortRowId === srId) {
                    groupRows.push(sectionRows[j]);
                    j++;
                }
                const first = groupRows[0];
                const sr = first.shortRowInfo;
                if (!sr) {
                    i = j;
                    continue;
                }
                // Transfer(s) instruction(s) if needed
                let transferText = '';
                if (sr.heldStitchesLeft) transferText += `Transfer ${sr.heldStitchesLeft} stitch${sr.heldStitchesLeft > 1 ? 'es' : ''} on left to waste yarn holder. `;
                if (sr.heldStitchesRight) transferText += `Transfer ${sr.heldStitchesRight} stitch${sr.heldStitchesRight > 1 ? 'es' : ''} on right to waste yarn holder.`;
                if (transferText.trim().length > 0) {
                    instructions.push({
                        text: transferText.trim(),
                        stepData: {
                            text: transferText.trim(),
                            startRowIndex: baseRowIndex + i,
                            endRowIndex: baseRowIndex + i,
                            rowsInStep: 1,
                            absolutePositioning: this.getAbsolutePosition(first)
                        },
                        rows: [transferText.trim()]
                    } as any);
                }
                // Knit instruction (use first row's RC and stitch counts)
                const knitText = `Machine-knit across ${sr.activeStitchesLeft + sr.activeStitchesRight} needles (${sr.activeStitchesLeft} left, ${sr.activeStitchesRight} right). (RC=${first.rowNumber})`;
                instructions.push({
                    text: knitText,
                    stepData: {
                        text: knitText,
                        startRowIndex: baseRowIndex + i,
                        endRowIndex: baseRowIndex + i,
                        rowsInStep: 1,
                        absolutePositioning: this.getAbsolutePosition(first)
                    },
                    rows: [knitText]
                } as any);
                i = j;
                continue;
            }

            // Non-short-row: treat consecutive identical rows as a rectangular block
            let consecutive = 1;
            let prev = row;
            for (let j = i + 1; j < sectionRows.length; j++) {
                const next = sectionRows[j];
                if (next.shortRowInfo) break;
                if (next.leftStitchesInWork === prev.leftStitchesInWork && next.rightStitchesInWork === prev.rightStitchesInWork) {
                    consecutive++;
                    prev = next;
                } else break;
            }

            const lastRow = sectionRows[Math.min(sectionRows.length - 1, i + consecutive - 1)];
            const total = lastRow.leftStitchesInWork + lastRow.rightStitchesInWork;

            // Machine-specific phrasing
            const phrasing = this.knittingOptions.machineType === 'sl1' ? 'Pass yarn carriage' : 'Machine-knit';
            const instrText = `${phrasing} across ${total} needles for ${consecutive} rows. (RC=${lastRow.rowNumber})`;

            // Add per-row instructions for this block
            const stepRows: string[] = [];
            for (let k = 0; k < consecutive; k++) {
                const r = sectionRows[i + k];
                stepRows.push(`Row ${r.rowNumber}: ${phrasing} across ${r.leftStitchesInWork + r.rightStitchesInWork} needles (${r.leftStitchesInWork} left, ${r.rightStitchesInWork} right). (RC=${r.rowNumber})`);
            }

            instructions.push({
                text: instrText,
                stepData: {
                    text: instrText,
                    startRowIndex: baseRowIndex + i,
                    endRowIndex: baseRowIndex + i + consecutive - 1,
                    rowsInStep: consecutive,
                    absolutePositioning: this.getAbsolutePosition(lastRow)
                },
                rows: stepRows
            } as any);

            i += consecutive;
        }

        return instructions;
    }
}

export default MachineKnittingActualizer;
