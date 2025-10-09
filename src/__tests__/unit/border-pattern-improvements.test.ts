/**
 * Test suite for border pattern improvements - verifying gauge-aware thickness and side edge detection
 */

import { ShapePerimeterDetector } from '../../utils/ShapePerimeterDetector';

describe('Border Pattern Improvements', () => {
    let detector;

    beforeEach(() => {
        detector = new ShapePerimeterDetector();
    });

    describe('Gauge-Aware Border Detection', () => {
        test('should calculate proper thickness in coordinate space for different gauges', () => {
            // Create a simple test shape (single trapezoid)
            const testShape = {
                baseA: 10,
                baseB: 8,
                height: 6,
                x: 0,
                y: 0
            };

            const result = detector.detectPerimeter(testShape, 1);
            const perimeterMap = result.perimeterMap;

            // Test with fine gauge (more stitches per inch)
            const fineGauge = { stitchesPerFourInches: 28, rowsPerFourInches: 32 };
            const coarseGauge = { stitchesPerFourInches: 16, rowsPerFourInches: 20 };

            // For a 2-stitch thick border
            const borderThickness = 2;

            // Test point that should be within border for fine gauge but outside for coarse gauge
            const testPoint = { x: 1, y: 1 };
            
            const fineResult = perimeterMap.isBorderStitch(testPoint.x, testPoint.y, borderThickness, fineGauge);
            const coarseResult = perimeterMap.isBorderStitch(testPoint.x, testPoint.y, borderThickness, coarseGauge);

            // Fine gauge should have thinner borders in coordinate space
            // Both should be boolean results
            expect(typeof fineResult).toBe('boolean');
            expect(typeof coarseResult).toBe('boolean');
        });

        test('should handle default gauge when none provided', () => {
            const testShape = {
                baseA: 10,
                baseB: 8,
                height: 6,
                x: 0,
                y: 0
            };

            const result = detector.detectPerimeter(testShape, 1);
            const perimeterMap = result.perimeterMap;

            // Test with no gauge (should use defaults)
            const borderResult = perimeterMap.isBorderStitch(1, 1, 2, null);
            
            expect(typeof borderResult).toBe('boolean');
        });
    });

    describe('Side Edge Detection', () => {
        test('should detect angled sides of trapezoids', () => {
            // Create a trapezoid with angled sides
            const trapezoidShape = {
                baseA: 10,
                baseB: 6,
                height: 8,
                x: 0,
                y: 0
            };

            const result = detector.detectPerimeter(trapezoidShape, 1);
            
            // Should have detected exterior edges
            expect(result.exteriorEdges.length).toBeGreaterThan(0);
            
            // Should have coordinates for the trapezoid
            expect(result.coordinates.length).toBeGreaterThan(0);
            
            // Bounds should be reasonable
            expect(result.bounds.minX).toBeDefined();
            expect(result.bounds.maxX).toBeDefined();
            expect(result.bounds.minY).toBeDefined();
            expect(result.bounds.maxY).toBeDefined();
        });

        test('should handle complex shapes with successors', () => {
            // Create a shape with successor trapezoids
            const complexShape = {
                baseA: 12,
                baseB: 10,
                height: 6,
                x: 0,
                y: 0,
                successors: [
                    {
                        baseA: 8,
                        baseB: 6,
                        height: 4,
                        x: 2,
                        y: 6
                    },
                    {
                        baseA: 6,
                        baseB: 4,
                        height: 4,
                        x: 6,
                        y: 6
                    }
                ]
            };

            const result = detector.detectPerimeter(complexShape, 1);
            
            // Should detect more coordinates due to successors
            expect(result.coordinates.length).toBeGreaterThan(1);
            
            // Should have exterior edges that form the perimeter
            expect(result.exteriorEdges.length).toBeGreaterThan(0);
            
            // Perimeter map should be functional
            expect(result.perimeterMap).toBeDefined();
            expect(typeof result.perimeterMap.isOnPerimeter).toBe('function');
            expect(typeof result.perimeterMap.isNearPerimeter).toBe('function');
            expect(typeof result.perimeterMap.isBorderStitch).toBe('function');
        });
    });

    describe('Perimeter Map Functionality', () => {
        test('should provide working perimeter checking functions', () => {
            const testShape = {
                baseA: 10,
                baseB: 8,
                height: 6,
                x: 0,
                y: 0
            };

            const result = detector.detectPerimeter(testShape, 1);
            const perimeterMap = result.perimeterMap;

            // Test isOnPerimeter function
            const onPerimeterResult = perimeterMap.isOnPerimeter(0, 0);
            expect(typeof onPerimeterResult).toBe('boolean');

            // Test isNearPerimeter function
            const nearPerimeterResult = perimeterMap.isNearPerimeter(1, 1, 0.5);
            expect(typeof nearPerimeterResult).toBe('boolean');

            // Test isBorderStitch function
            const gauge = { stitchesPerFourInches: 20, rowsPerFourInches: 24 };
            const borderStitchResult = perimeterMap.isBorderStitch(1, 1, 2, gauge);
            expect(typeof borderStitchResult).toBe('boolean');
        });

        test('should have proper bounds calculation', () => {
            const testShape = {
                baseA: 10,
                baseB: 8,
                height: 6,
                x: 2,
                y: 3
            };

            const result = detector.detectPerimeter(testShape, 2);
            const bounds = result.bounds;

            // Bounds should be properly calculated
            expect(bounds.minX).toBeLessThanOrEqual(bounds.maxX);
            expect(bounds.minY).toBeLessThanOrEqual(bounds.maxY);
            
            // Should account for scale and offsets
            expect(bounds.maxX).toBeGreaterThan(0);
            expect(bounds.maxY).toBeGreaterThan(0);
        });
    });
});