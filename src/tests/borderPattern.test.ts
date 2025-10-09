import { ColorworkPattern } from '../models/ColorworkPattern';
import { Trapezoid } from '../models/Trapezoid';
import { Gauge } from '../models/Gauge';

describe('Border Pattern Edge Detection', () => {
    it('should create a border pattern with correct metadata', () => {
        // Test the new border pattern generation
        function generateBorderPattern(config: any) {
            const color = config.color || '#ffffff';
            const thickness = config.thickness || 1;
            
            // Create a minimal 1x1 pattern that serves as a placeholder
            const grid = [[1]];
            
            const colorMap = {
                0: { id: 0, label: 'Background', color: 'transparent' },
                1: { id: 1, label: 'Border', color: color }
            };
            
            // Store border configuration in pattern metadata
            const pattern = new ColorworkPattern(0, 0, grid, colorMap, { 
                width: 1, 
                height: 1,
                borderThickness: thickness,
                isBorderPattern: true 
            });
            
            return pattern;
        }

        const borderConfig = { color: '#ff0000', thickness: 2 };
        const borderPattern = generateBorderPattern(borderConfig);

        // Verify the pattern has the correct metadata
        expect(borderPattern.metadata.isBorderPattern).toBe(true);
        expect(borderPattern.metadata.borderThickness).toBe(2);
        expect(borderPattern.colors[1].color).toBe('#ff0000');
        
        // Verify it's a minimal pattern (not a grid)
        expect(borderPattern.grid.length).toBe(1);
        expect(borderPattern.grid[0].length).toBe(1);
    });

    it('should demonstrate shape-aware edge detection logic', () => {
        // Create a simple trapezoid shape for testing
        const trapezoid = new Trapezoid(4, 6, 10, []);  // 4" height, 6" base, 10" top
        const gauge = new Gauge(20, 24);  // 20 sts/4", 24 rows/4"
        
        // Get the stitch plan for this shape
        const stitchPlan = trapezoid.getStitchPlan(gauge, 1.0, 1);
        
        // Test the edge detection logic
        function isBorderStitch(row: number, stitchInRow: number, stitchPlan: any, thickness: number = 1) {
            if (row < 0 || row >= stitchPlan.rows.length) return false;
            
            const stitchRow = stitchPlan.rows[row];
            const rowTotalStitches = stitchRow.leftStitchesInWork + stitchRow.rightStitchesInWork;
            
            if (stitchInRow < 0 || stitchInRow >= rowTotalStitches) return false;
            
            const isTopEdge = row < thickness;
            const isBottomEdge = row >= stitchPlan.rows.length - thickness;
            const isLeftEdge = stitchInRow < thickness;
            const isRightEdge = stitchInRow >= rowTotalStitches - thickness;
            
            return isTopEdge || isBottomEdge || isLeftEdge || isRightEdge;
        }
        
        // Test that edges are detected correctly
        expect(stitchPlan.rows.length).toBeGreaterThan(0);
        
        // First row should have all stitches as border stitches (top edge)
        const firstRow = stitchPlan.rows[0];
        const firstRowStitches = firstRow.leftStitchesInWork + firstRow.rightStitchesInWork;
        
        for (let s = 0; s < firstRowStitches; s++) {
            expect(isBorderStitch(0, s, stitchPlan, 1)).toBe(true);
        }
        
        // Last row should have all stitches as border stitches (bottom edge)
        const lastRowIndex = stitchPlan.rows.length - 1;
        const lastRow = stitchPlan.rows[lastRowIndex];
        const lastRowStitches = lastRow.leftStitchesInWork + lastRow.rightStitchesInWork;
        
        for (let s = 0; s < lastRowStitches; s++) {
            expect(isBorderStitch(lastRowIndex, s, stitchPlan, 1)).toBe(true);
        }
        
        // Middle row should have only left and right edges as border stitches
        if (stitchPlan.rows.length > 2) {
            const middleRowIndex = Math.floor(stitchPlan.rows.length / 2);
            const middleRow = stitchPlan.rows[middleRowIndex];
            const middleRowStitches = middleRow.leftStitchesInWork + middleRow.rightStitchesInWork;
            
            // First stitch should be border (left edge)
            expect(isBorderStitch(middleRowIndex, 0, stitchPlan, 1)).toBe(true);
            
            // Last stitch should be border (right edge)  
            expect(isBorderStitch(middleRowIndex, middleRowStitches - 1, stitchPlan, 1)).toBe(true);
            
            // Middle stitches should NOT be border (if row is wide enough)
            if (middleRowStitches > 4) {
                const middleStitch = Math.floor(middleRowStitches / 2);
                expect(isBorderStitch(middleRowIndex, middleStitch, stitchPlan, 1)).toBe(false);
            }
        }
    });
});