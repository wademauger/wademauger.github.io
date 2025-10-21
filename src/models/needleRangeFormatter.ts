export type NeedleRange = {
    leftStitches: number;
    rightStitches: number;
    totalStitches: number;
    maxNeedlesPerSide?: number;
};

// Format LK-style compact needle range: L{left}-R{right}
export function formatNeedleRange({ leftStitches, rightStitches, totalStitches, maxNeedlesPerSide }: NeedleRange) {
    const maxSide = typeof maxNeedlesPerSide === 'number' ? maxNeedlesPerSide : Math.max(leftStitches, rightStitches);
    const left = Math.min(leftStitches, maxSide);
    const right = Math.min(rightStitches, maxSide);

    // If both sides exist, show L{left}-R{right}
    if (left > 0 && right > 0) {
        return `L${left}-R${right}`;
    }

    // Only left side
    if (left > 0) return `L1-L${left}`;

    // Only right side
    if (right > 0) return `R1-R${right}`;

    return '';
}

export default formatNeedleRange;
