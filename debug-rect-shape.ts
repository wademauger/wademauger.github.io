// Quick debug script to understand the issue
// Save this temporarily to debug what's being generated

import { generateConcreteStitchPlan } from './src/utils/stitchPlanGenerator';

const rectShape = {
    'height': 10,
    'baseA': 25,
    'baseB': 25,
    'successors': []
};

const stitchPlan = generateConcreteStitchPlan(
    rectShape,
    { stitchesPerFourInches: 19, rowsPerFourInches: 30, scalingFactor: 1 },
    [],
    'rectangle'
);

console.log('=== DEBUGGING RECTANGULAR SHAPE ===');
console.log('Total rows:', stitchPlan.rows.length);

// Show first few rows
console.log('\nFirst 5 rows:');
for (let i = 0; i < Math.min(5, stitchPlan.rows.length); i++) {
    const row = stitchPlan.rows[i];
    console.log(`Row ${i}: RC=${row.rowNumber}, left=${row.leftStitchesInWork}, right=${row.rightStitchesInWork}, total=${row.leftStitchesInWork + row.rightStitchesInWork}`);
}

// Check first and last
const firstRow = stitchPlan.rows[0];
const lastRow = stitchPlan.rows[stitchPlan.rows.length - 1];

console.log('\nFirst row:', {
    rowNumber: firstRow.rowNumber,
    left: firstRow.leftStitchesInWork,
    right: firstRow.rightStitchesInWork,
    total: firstRow.leftStitchesInWork + firstRow.rightStitchesInWork
});

console.log('Last row:', {
    rowNumber: lastRow.rowNumber,
    left: lastRow.leftStitchesInWork,
    right: lastRow.rightStitchesInWork,
    total: lastRow.leftStitchesInWork + lastRow.rightStitchesInWork
});

// Check if rectangular
const isRectangular = 
    firstRow.leftStitchesInWork === lastRow.leftStitchesInWork &&
    firstRow.rightStitchesInWork === lastRow.rightStitchesInWork;

console.log('\nIs rectangular?', isRectangular);

// Check for stitch differences between consecutive rows
console.log('\nRow-by-row differences:');
let allZero = true;
for (let i = 1; i < Math.min(35, stitchPlan.rows.length); i++) {
    const prev = stitchPlan.rows[i-1];
    const curr = stitchPlan.rows[i];
    const leftDiff = curr.leftStitchesInWork - prev.leftStitchesInWork;
    const rightDiff = curr.rightStitchesInWork - prev.rightStitchesInWork;
    
    if (leftDiff !== 0 || rightDiff !== 0) {
        console.log(`Row ${i}: leftDiff=${leftDiff}, rightDiff=${rightDiff}`);
        allZero = false;
    }
}

if (allZero) {
    console.log('(All zeros - truly rectangular)');
}
