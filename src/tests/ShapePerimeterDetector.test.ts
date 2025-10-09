import { ShapePerimeterDetector } from '../utils/ShapePerimeterDetector';

describe('ShapePerimeterDetector', () => {
    let detector;
    
    beforeEach(() => {
        detector = new ShapePerimeterDetector();
    });

    it('should detect perimeter of a simple single trapezoid', () => {
        // Simple trapezoid: 4" high, 6" base, 4" top
        const shape = {
            height: 4,
            baseA: 6,    // bottom base
            baseB: 4,    // top base  
            baseBHorizontalOffset: 0,
            successors: []
        };

        const result = detector.detectPerimeter(shape, 1);

        // Should have one trapezoid
        expect(result.coordinates.length).toBe(1);
        
        // Should have 4 edges total
        expect(result.edges.length).toBe(4);
        
        // All edges should be exterior (no shared edges)
        expect(result.exteriorEdges.length).toBe(4);
        
        // Verify perimeter map exists
        expect(result.perimeterMap).toBeDefined();
        expect(result.perimeterMap.isOnPerimeter).toBeInstanceOf(Function);
        expect(result.perimeterMap.isNearPerimeter).toBeInstanceOf(Function);
        
        // Test bounds calculation
        expect(result.bounds.minX).toBeLessThan(result.bounds.maxX);
        expect(result.bounds.minY).toBeLessThan(result.bounds.maxY);
    });

    it('should detect shared edges in complex shape', () => {
        // Parent trapezoid with one successor (child on top)
        const shape = {
            height: 4,
            baseA: 6,    
            baseB: 4,    
            baseBHorizontalOffset: 0,
            successors: [{
                height: 2,
                baseA: 4,    // This should align with parent's baseB
                baseB: 2,    
                baseBHorizontalOffset: 0,
                successors: []
            }]
        };

        const result = detector.detectPerimeter(shape, 1);

        // Should have two trapezoids
        expect(result.coordinates.length).toBe(2);
        
        // Should have 8 edges total (4 per trapezoid)
        expect(result.edges.length).toBe(8);
        
        // Should have fewer exterior edges than total (some are shared)
        expect(result.exteriorEdges.length).toBeLessThan(8);
        expect(result.exteriorEdges.length).toBeGreaterThan(0);
    });

    it('should correctly identify perimeter points', () => {
        const shape = {
            height: 2,
            baseA: 4,    
            baseB: 2,    
            baseBHorizontalOffset: 0,
            successors: []
        };

        const result = detector.detectPerimeter(shape, 1);
        const { perimeterMap } = result;
        
        // Get the trapezoid coordinates
        const coord = result.coordinates[0];
        
        // Corner points should be on perimeter
        expect(perimeterMap.isOnPerimeter(coord.topLeft.x, coord.topLeft.y)).toBe(true);
        expect(perimeterMap.isOnPerimeter(coord.topRight.x, coord.topRight.y)).toBe(true);
        expect(perimeterMap.isOnPerimeter(coord.bottomLeft.x, coord.bottomLeft.y)).toBe(true);
        expect(perimeterMap.isOnPerimeter(coord.bottomRight.x, coord.bottomRight.y)).toBe(true);
        
        // Center point should not be on perimeter
        const centerX = (coord.topLeft.x + coord.topRight.x) / 2;
        const centerY = (coord.topLeft.y + coord.bottomLeft.y) / 2;
        expect(perimeterMap.isOnPerimeter(centerX, centerY)).toBe(false);
    });

    it('should handle edge overlap detection', () => {
        // Create two edges that overlap
        const edge1 = {
            start: { x: 0, y: 0 },
            end: { x: 4, y: 0 }
        };
        
        const edge2 = {
            start: { x: 2, y: 0 },
            end: { x: 6, y: 0 }
        };
        
        expect(detector.edgesOverlap(edge1, edge2)).toBe(true);
        
        // Non-overlapping edges
        const edge3 = {
            start: { x: 0, y: 1 },
            end: { x: 4, y: 1 }
        };
        
        expect(detector.edgesOverlap(edge1, edge3)).toBe(false);
    });
});