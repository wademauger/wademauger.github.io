/**
 * Example demonstrating colorwork compression on a real knitting pattern
 */

import { compressColorwork, getCompressionStats } from './colorworkCompression';

// Example: A 96-stitch row from a real Fair Isle sweater pattern
// Structure: 10 MC (edge), checkerboard pattern in center (76 stitches), 10 MC (edge)

const exampleRow1_AllMC = new Array(96).fill('MC');

const exampleRow2_FairIsle = [
  ...new Array(10).fill('MC'), // Left edge
  // Center: 2-stitch checkerboard pattern repeated 19 times (38 stitches)
  ...Array(19).fill(['MC', 'CC1']).flat(),
  ...new Array(10).fill('MC') // Right edge
];

const exampleRow3_ComplexFairIsle = [
  ...new Array(8).fill('MC'), // Left edge
  // 4-stitch pattern repeated 15 times (60 stitches)
  ...Array(15).fill(['MC', 'MC', 'CC1', 'CC1']).flat(),
  ...new Array(8).fill('MC'), // Right edge  
  // Small accent
  'CC2', 'CC2', 'CC2', 'CC2',
  ...new Array(8).fill('MC')
];

console.log('=== COLORWORK COMPRESSION EXAMPLES ===\n');

// Example 1: All MC (very common for plain rows)
console.log('Example 1: Plain row (all MC)');
console.log('Uncompressed size:', exampleRow1_AllMC.length, 'colors');
const compressed1 = compressColorwork(exampleRow1_AllMC);
console.log('Compressed:', JSON.stringify(compressed1, null, 2));
const stats1 = getCompressionStats(exampleRow1_AllMC, compressed1);
console.log('Stats:', stats1);
console.log('\n---\n');

// Example 2: Fair Isle with checkerboard
console.log('Example 2: Fair Isle with 2-color checkerboard');
console.log('Uncompressed size:', exampleRow2_FairIsle.length, 'colors');
const compressed2 = compressColorwork(exampleRow2_FairIsle);
console.log('Compressed:', JSON.stringify(compressed2, null, 2));
const stats2 = getCompressionStats(exampleRow2_FairIsle, compressed2);
console.log('Stats:', stats2);
console.log('\n---\n');

// Example 3: Complex Fair Isle
console.log('Example 3: Complex Fair Isle with multiple patterns');
console.log('Uncompressed size:', exampleRow3_ComplexFairIsle.length, 'colors');
const compressed3 = compressColorwork(exampleRow3_ComplexFairIsle);
console.log('Compressed:', JSON.stringify(compressed3, null, 2));
const stats3 = getCompressionStats(exampleRow3_ComplexFairIsle, compressed3);
console.log('Stats:', stats3);
console.log('\n---\n');

// Calculate total savings for a 98-row pattern
console.log('=== TOTAL PATTERN SAVINGS ===');
console.log('Assume 98-row pattern with 96 stitches per row');
console.log('Mix: 30 plain rows, 50 simple Fair Isle, 18 complex Fair Isle\n');

const totalUncompressed = 98 * 96;
const plainCompressed = 30 * 2; // Each plain row: 2 units (color + count)
const simpleCompressed = 50 * 6; // Each simple Fair Isle: ~6 units
const complexCompressed = 18 * 12; // Each complex Fair Isle: ~12 units
const totalCompressed = plainCompressed + simpleCompressed + complexCompressed;

console.log('Uncompressed total:', totalUncompressed, 'color strings');
console.log('Compressed total (approx):', totalCompressed, 'units');
console.log('Compression ratio:', (totalUncompressed / totalCompressed).toFixed(2) + 'x');
console.log('Space saved:', ((1 - totalCompressed / totalUncompressed) * 100).toFixed(1) + '%');
console.log('\nJSON size estimate:');
console.log('Before: ~' + Math.round(totalUncompressed * 8) + ' bytes (strings + array overhead)');
console.log('After: ~' + Math.round(totalCompressed * 12) + ' bytes (objects + metadata)');
console.log('Reduction: ~' + Math.round((1 - (totalCompressed * 12) / (totalUncompressed * 8)) * 100) + '%');
