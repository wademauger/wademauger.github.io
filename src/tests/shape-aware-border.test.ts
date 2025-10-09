import { ShapePerimeterDetector } from '../utils/ShapePerimeterDetector';
import { ColorworkPattern } from '../models/ColorworkPattern';

describe('Shape-Aware Border Pattern Implementation', () => {
    it('should properly integrate perimeter detection with border pattern rendering', () => {
        // Create a simple trapezoid shape
        const shape = {
            height: 4,
            baseA: 6,    // bottom base
            baseB: 4,    // top base  
            baseBHorizontalOffset: 0,
            successors: []
        };

        // Test perimeter detection
        const detector = new ShapePerimeterDetector();
        const perimeterInfo = detector.detectPerimeter(shape, 1);

        // Verify perimeter detection works
        expect(perimeterInfo).toBeDefined();
        expect(perimeterInfo.coordinates.length).toBe(1);
        expect(perimeterInfo.exteriorEdges.length).toBe(4);
        expect(perimeterInfo.perimeterMap).toBeDefined();

        // Test border pattern generation
        const borderConfig = { color: '#ff0000', thickness: 2 };
        const borderPattern = new ColorworkPattern(0, 0, [[1]], {
            0: { id: 0, label: 'Background', color: 'transparent' },
            1: { id: 1, label: 'Border', color: borderConfig.color }
        }, { 
            width: 1, 
            height: 1,
            borderThickness: borderConfig.thickness,
            isBorderPattern: true 
        });

        // Verify border pattern metadata
        expect(borderPattern.metadata.isBorderPattern).toBe(true);
        expect(borderPattern.metadata.borderThickness).toBe(2);

        // Test coordinate mapping (simulating grid to shape coordinate conversion)
        const bounds = perimeterInfo.bounds;
        const gridWidth = 20;  // Simulate 20 stitches wide
        const gridHeight = 16; // Simulate 16 rows high

        let borderStitchCount = 0;
        for (let row = 0; row < gridHeight; row++) {
            for (let stitch = 0; stitch < gridWidth; stitch++) {
                // Convert grid coordinates to shape coordinates
                const shapeX = bounds.minX + (stitch / gridWidth) * (bounds.maxX - bounds.minX);
                const shapeY = bounds.minY + (row / gridHeight) * (bounds.maxY - bounds.minY);
                
                // Check if this point is near the perimeter (thickness of 1 unit)
                const isOnPerimeter = perimeterInfo.perimeterMap.isNearPerimeter(shapeX, shapeY, 1.0);
                
                if (isOnPerimeter) {
                    borderStitchCount++;
                }
            }
        }

        // Should have border stitches (not zero, not all stitches)
        expect(borderStitchCount).toBeGreaterThan(0);
        expect(borderStitchCount).toBeLessThan(gridWidth * gridHeight);

        console.log(`Border pattern detected on ${borderStitchCount} stitches out of ${gridWidth * gridHeight} total stitches`);
    });

    it('should handle complex shapes with successors', () => {
        // Parent trapezoid with child
        const complexShape = {
            height: 4,
            baseA: 6,    
            baseB: 4,    
            baseBHorizontalOffset: 0,
            successors: [{
                height: 2,
                baseA: 4,    // Aligns with parent's top
                baseB: 2,    
                baseBHorizontalOffset: 0,
                successors: []
            }]
        };

        const detector = new ShapePerimeterDetector();
        const perimeterInfo = detector.detectPerimeter(complexShape, 1);

        // Should have two trapezoids
        expect(perimeterInfo.coordinates.length).toBe(2);
        
        // Should have exterior edges (fewer than total due to shared edges)
        expect(perimeterInfo.exteriorEdges.length).toBeLessThan(8); // 8 total edges
        expect(perimeterInfo.exteriorEdges.length).toBeGreaterThan(4); // More than simple shape
    });

    it('should provide working perimeter map functions', () => {
        const shape = {
            height: 2,
            baseA: 4,    
            baseB: 2,    
            baseBHorizontalOffset: 0,
            successors: []
        };

        const detector = new ShapePerimeterDetector();
        const perimeterInfo = detector.detectPerimeter(shape, 1);
        const { perimeterMap } = perimeterInfo;

        // Test corner points are on perimeter
        const coords = perimeterInfo.coordinates[0];
        expect(perimeterMap.isOnPerimeter(coords.topLeft.x, coords.topLeft.y)).toBe(true);
        expect(perimeterMap.isOnPerimeter(coords.topRight.x, coords.topRight.y)).toBe(true);
        
        // Test center point is not on perimeter (but might be near it)
        const centerX = (coords.topLeft.x + coords.topRight.x) / 2;
        const centerY = (coords.topLeft.y + coords.bottomLeft.y) / 2;
        expect(perimeterMap.isOnPerimeter(centerX, centerY)).toBe(false);
        
        // Test isNearPerimeter function
        expect(typeof perimeterMap.isNearPerimeter).toBe('function');
        const nearResult = perimeterMap.isNearPerimeter(centerX, centerY, 2.0);
        expect(typeof nearResult).toBe('boolean');
    });
});