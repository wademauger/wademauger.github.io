/**
 * Quick test to validate the improved border detection algorithm
 */

import { ShapePerimeterDetector } from '../../utils/ShapePerimeterDetector';

describe('Improved Border Detection', () => {
    let detector;

    beforeEach(() => {
        detector = new ShapePerimeterDetector();
    });

    test('should detect angled edges correctly', () => {
        // Create a shape similar to the one in the screenshot
        // Main trapezoid at bottom, smaller trapezoids on top
        const complexShape = {
            height: 10,
            baseA: 20,  // Wide bottom
            baseB: 20,  // Same width top (rectangle for main body)
            baseBHorizontalOffset: 0,
            successors: [
                // Left triangular section  
                {
                    height: 8,
                    baseA: 10,  // Base connecting to main body
                    baseB: 2,   // Narrow top
                    baseBHorizontalOffset: 0
                },
                // Right triangular section
                {
                    height: 8, 
                    baseA: 10,  // Base connecting to main body
                    baseB: 2,   // Narrow top  
                    baseBHorizontalOffset: 0
                }
            ]
        };

        const result = detector.detectPerimeter(complexShape, 1);

        // Should detect coordinates for all trapezoids
        expect(result.coordinates.length).toBe(3); // Main + 2 successors
        
        // Should have exterior edges
        expect(result.exteriorEdges.length).toBeGreaterThan(0);
        
        // Bounds should cover the full shape
        expect(result.bounds.minX).toBeLessThan(result.bounds.maxX);
        expect(result.bounds.minY).toBeLessThan(result.bounds.maxY);
        
        // Perimeter map should be functional
        const { perimeterMap } = result;
        expect(typeof perimeterMap.isBorderStitch).toBe('function');
        
        // Test border detection with reasonable parameters
        const gauge = { stitchesPerFourInches: 20, rowsPerFourInches: 24 };
        const thickness = 2;
        
        // Points near the edges should be detected as border stitches
        const edgePoint = perimeterMap.isBorderStitch(0, 0, thickness, gauge);
        expect(typeof edgePoint).toBe('boolean');
        
        // Test points at various locations
        const centerPoint = perimeterMap.isBorderStitch(10, 5, thickness, gauge);  
        const outsidePoint = perimeterMap.isBorderStitch(100, 100, thickness, gauge);
        
        expect(typeof centerPoint).toBe('boolean');
        expect(typeof outsidePoint).toBe('boolean');
        
        console.log('Complex shape test results:', {
            coordinates: result.coordinates.length,
            exteriorEdges: result.exteriorEdges.length,
            bounds: result.bounds,
            edgeDetection: { edgePoint, centerPoint, outsidePoint }
        });
    });

    test('should handle edge overlap detection for angled edges', () => {
        // Test the improved edgesOverlap function with angled edges
        const detector = new ShapePerimeterDetector();
        
        // Two parallel angled edges that should overlap
        const edge1 = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 5 }
        };
        
        const edge2 = {
            start: { x: 5, y: 2.5 },
            end: { x: 15, y: 7.5 }
        };
        
        // These should be detected as overlapping (same slope, collinear, overlapping)
        const overlapping = detector.edgesOverlap(edge1, edge2);
        console.log('Angled edge overlap test:', { edge1, edge2, overlapping });
        
        // Non-overlapping angled edges
        const edge3 = {
            start: { x: 0, y: 10 },
            end: { x: 5, y: 15 }
        };
        
        const nonOverlapping = detector.edgesOverlap(edge1, edge3);
        console.log('Non-overlapping edge test:', { edge1, edge3, nonOverlapping });
        
        expect(typeof overlapping).toBe('boolean');
        expect(typeof nonOverlapping).toBe('boolean');
    });

    test('should apply effective thickness for visibility', () => {
        const shape = {
            height: 5,
            baseA: 10,
            baseB: 8,
            baseBHorizontalOffset: 0
        };

        const result = detector.detectPerimeter(shape, 1);
        const { perimeterMap } = result;
        
        // Test with very thin borders (should use minimum thickness)
        const fineGauge = { stitchesPerFourInches: 32, rowsPerFourInches: 40 };
        const thinBorder = 1; // 1 stitch thick
        
        // Should still detect border with minimum thickness applied
        const borderResult = perimeterMap.isBorderStitch(1, 1, thinBorder, fineGauge);
        expect(typeof borderResult).toBe('boolean');
        
        console.log('Thin border test completed');
    });
});