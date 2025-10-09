/**
 * ShapePerimeterDetector - Utility for detecting the exterior perimeter of complex trapezoid shapes
 * 
 * This handles the case where a panel is composed of multiple trapezoids and we need to 
 * identify which edges are on the exterior perimeter vs interior shared edges.
 */

export class ShapePerimeterDetector {
    coordinates: any[];
    edges: any[];
    exteriorEdges: any[];
    tolerance: number;

    constructor() {
        this.coordinates = [];
        this.edges = [];
        this.exteriorEdges = [];
        this.tolerance = 0.001; // For floating point comparison
    }

    /**
     * Analyze a shape and detect its exterior perimeter
     * @param {*} shape - The trapezoid shape (can be complex with successors)
     * @param {number} scale - Scale factor for rendering
     * @returns {Object} Perimeter information including exterior edges and grid mapping
     */
    detectPerimeter(shape: any, scale: number = 1) {
        // Clear previous results
        this.coordinates = [];
        this.edges = [];
        this.exteriorEdges = [];

        // Collect all trapezoid coordinates
        this.collectTrapezoidCoordinates(shape, scale);

        // Extract all edges from all trapezoids
        this.extractAllEdges();

        // Find exterior edges (edges that don't have adjacent edges)
        this.findExteriorEdges();

        // Create a perimeter map for efficient boundary checking
        const perimeterMap = this.createPerimeterMap();
        const bounds = this.calculateBounds();

        return {
            coordinates: this.coordinates,
            edges: this.edges,
            exteriorEdges: this.exteriorEdges,
            perimeterMap: perimeterMap,
            bounds: bounds
        };
    }

    /**
     * Collect coordinates for all trapezoids in the shape hierarchy
     */
    collectTrapezoidCoordinates(trap: any, scale: number, xOffset: number = 0, yOffset: number = 0) {
        const trapWidth = Math.max(trap.baseA, trap.baseB) * scale;
        const xTopLeft = xOffset + (trapWidth - trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xTopRight = xOffset + (trapWidth + trap.baseB * scale) / 2 + (trap.baseBHorizontalOffset || 0) * scale;
        const xBottomLeft = xOffset + (trapWidth - trap.baseA * scale) / 2;
        const xBottomRight = xOffset + (trapWidth + trap.baseA * scale) / 2;
        const yTop = yOffset;
        const yBottom = yOffset + trap.height * scale;

        this.coordinates.push({
            trapezoid: trap,
            topLeft: { x: xTopLeft, y: yTop },
            topRight: { x: xTopRight, y: yTop },
            bottomLeft: { x: xBottomLeft, y: yBottom },
            bottomRight: { x: xBottomRight, y: yBottom }
        });

        // Process successors (children)
        if (trap.successors && trap.successors.length > 0) {
            const successorWidths = trap.successors.map((s: any) => Math.max(s.baseA, s.baseB) * scale);
            const totalSuccessorWidth = successorWidths.reduce((sum: number, w: number) => sum + w, 0);
            let childXOffset = xOffset + (trapWidth - totalSuccessorWidth) / 2;

            for (let i = trap.successors.length - 1; i >= 0; i--) {
                const successor = trap.successors[i];
                const successorWidth = successorWidths[i];
                this.collectTrapezoidCoordinates(
                    successor, 
                    scale, 
                    childXOffset, 
                    yTop - successor.height * scale
                );
                childXOffset += successorWidth;
            }
        }
    }

    /**
     * Extract all edges from all trapezoids
     */
    extractAllEdges() {
        this.coordinates.forEach(coord => {
            // Top edge
            this.edges.push({
                type: 'top',
                start: coord.topLeft,
                end: coord.topRight,
                trapezoid: coord.trapezoid
            });

            // Right edge
            this.edges.push({
                type: 'right',
                start: coord.topRight,
                end: coord.bottomRight,
                trapezoid: coord.trapezoid
            });

            // Bottom edge
            this.edges.push({
                type: 'bottom',
                start: coord.bottomRight,
                end: coord.bottomLeft,
                trapezoid: coord.trapezoid
            });

            // Left edge
            this.edges.push({
                type: 'left',
                start: coord.bottomLeft,
                end: coord.topLeft,
                trapezoid: coord.trapezoid
            });
        });
    }

    /**
     * Find exterior edges by checking for adjacent/overlapping edges
     */
    findExteriorEdges() {
        this.exteriorEdges = this.edges.filter(edge => {
            // An edge is exterior if it doesn't overlap with any other edge
            const overlapping = this.edges.find(otherEdge => {
                if (edge === otherEdge) return false;
                return this.edgesOverlap(edge, otherEdge);
            });
            return !overlapping;
        });
    }

    /**
     * Check if two edges overlap (indicating they are shared between trapezoids)
     */
    edgesOverlap(edge1: any, edge2: any) {
        // Calculate vectors for both edges
        const v1 = { x: edge1.end.x - edge1.start.x, y: edge1.end.y - edge1.start.y };
        const v2 = { x: edge2.end.x - edge2.start.x, y: edge2.end.y - edge2.start.y };
        
        // Calculate lengths
        const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        if (len1 < this.tolerance || len2 < this.tolerance) return false;
        
        // Normalize vectors
        const n1 = { x: v1.x / len1, y: v1.y / len1 };
        const n2 = { x: v2.x / len2, y: v2.y / len2 };
        
        // Check if edges are parallel (dot product of normalized vectors ~= ±1)
        const dot = n1.x * n2.x + n1.y * n2.y;
        if (Math.abs(Math.abs(dot) - 1) > this.tolerance) return false;
        
        // Check if edges are collinear by checking if one start point is on the line of the other
        const startToStart = { x: edge2.start.x - edge1.start.x, y: edge2.start.y - edge1.start.y };
        const crossProduct = startToStart.x * n1.y - startToStart.y * n1.x;
        
        if (Math.abs(crossProduct) > this.tolerance) return false;
        
        // Edges are collinear, check for overlap
        // Project both edges onto the normalized vector
        const proj1Start = edge1.start.x * n1.x + edge1.start.y * n1.y;
        const proj1End = edge1.end.x * n1.x + edge1.end.y * n1.y;
        const proj2Start = edge2.start.x * n1.x + edge2.start.y * n1.y;
        const proj2End = edge2.end.x * n1.x + edge2.end.y * n1.y;
        
        const min1 = Math.min(proj1Start, proj1End);
        const max1 = Math.max(proj1Start, proj1End);
        const min2 = Math.min(proj2Start, proj2End);
        const max2 = Math.max(proj2Start, proj2End);
        
        // Check for overlap
        return !(max1 < min2 || max2 < min1);
    }

    /**
     * Create a perimeter map for efficient boundary checking during rendering
     */
    createPerimeterMap() {
        const bounds = this.calculateBounds();
        const gridResolution = 0.1; // Resolution for the perimeter grid
        
        const gridWidth = Math.ceil((bounds.maxX - bounds.minX) / gridResolution);
        const gridHeight = Math.ceil((bounds.maxY - bounds.minY) / gridResolution);
        
        // Capture references to avoid 'this' binding issues
        const exteriorEdges = this.exteriorEdges;
        const coordinates = this.coordinates;
        const tolerance = this.tolerance;
        
        const perimeterMap = {
            bounds,
            gridResolution,
            gridWidth,
            gridHeight,
            isOnPerimeter: (x: number, y: number) => {
                // Check if point (x, y) is on the perimeter
                return exteriorEdges.some(edge => this.pointOnEdge(x, y, edge));
            },
            isNearPerimeter: (x: number, y: number, distance = 0.5) => {
                // Check if point (x, y) is within distance of the perimeter
                return exteriorEdges.some(edge => this.pointNearEdge(x, y, edge, distance));
            },
            isBorderStitch: (x: number, y: number, thicknessInStitches: number, gauge: any) => {
                // Convert thickness from stitches to coordinate space (inches)
                const stitchesPerInch = gauge ? gauge.stitchesPerFourInches / 4 : 5; // Default 20 sts/4"
                const rowsPerInch = gauge ? gauge.rowsPerFourInches / 4 : 6; // Default 24 rows/4"
                
                // Since coordinate space is in inches and we're checking both horizontal and vertical proximity,
                // we need to convert stitch thickness to inches. Use the average of horizontal and vertical
                // gauge to get a balanced thickness.
                const avgResolutionPerInch = (stitchesPerInch + rowsPerInch) / 2;
                const thicknessInInches = thicknessInStitches / avgResolutionPerInch;
                
                // Use the thickness directly without artificial minimums
                // The thickness is already in inches, which is the correct unit for the coordinate space
                const effectiveThickness = thicknessInInches;
                
                // Check if point is near perimeter
                const nearPerimeter = exteriorEdges.some(edge => 
                    this.pointNearEdge(x, y, edge, effectiveThickness)
                );
                
                if (!nearPerimeter) return false;
                
                // A border stitch should be drawn if it's near the perimeter AND either:
                // 1. Inside the shape (main body of the border)
                // 2. Very close to any edge (to catch stitches at the boundary that might be slightly outside due to rounding)
                const insideShape = coordinates.some(coord => this.pointInTrapezoid(x, y, coord));
                const veryCloseToEdge = exteriorEdges.some(edge => 
                    this.pointNearEdge(x, y, edge, Math.min(effectiveThickness * 0.5, 0.1))
                );
                
                return insideShape || veryCloseToEdge;
            }
        };

        return perimeterMap;
    }

    /**
     * Check if a point is on an edge
     */
    pointOnEdge(x: number, y: number, edge: any) {
        const { start, end } = edge;
        
        // Check if point is on the line segment
        const crossProduct = (y - start.y) * (end.x - start.x) - (x - start.x) * (end.y - start.y);
        
        // Point is not on the line if cross product is not near zero
        if (Math.abs(crossProduct) > this.tolerance) return false;
        
        // Point is on the line - check if it's within the segment bounds
        const dotProduct = (x - start.x) * (end.x - start.x) + (y - start.y) * (end.y - start.y);
        const squaredLength = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
        
        const param = dotProduct / squaredLength;
        return param >= -this.tolerance && param <= 1 + this.tolerance;
    }

    /**
     * Check if a point is near an edge
     */
    pointNearEdge(x: number, y: number, edge: any, maxDistance: number) {
        const { start, end } = edge;
        
        // Calculate distance from point to line segment
        const A = x - start.x;
        const B = y - start.y;
        const C = end.x - start.x;
        const D = end.y - start.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        // Handle zero-length edges
        if (lenSq < 0.001) {
            const dx = x - start.x;
            const dy = y - start.y;
            return Math.sqrt(dx * dx + dy * dy) <= maxDistance;
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = start.x;
            yy = start.y;
        } else if (param > 1) {
            xx = end.x;
            yy = end.y;
        } else {
            xx = start.x + param * C;
            yy = start.y + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= maxDistance;
    }

    /**
     * Check if a point is inside the shape (for better border detection)
     */
    pointInsideShape(x: number, y: number) {
        // Use ray casting algorithm to check if point is inside any trapezoid
        for (const coord of this.coordinates) {
            if (this.pointInTrapezoid(x, y, coord)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a point is inside a specific trapezoid
     */
    pointInTrapezoid(x: number, y: number, coord: any) {
        const { topLeft, topRight, bottomLeft, bottomRight } = coord;
        
        // Use the cross product method for a quadrilateral
        // Create the vertices in order
        const vertices = [topLeft, topRight, bottomRight, bottomLeft];
        
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const vi = vertices[i];
            const vj = vertices[j];
            
            if (((vi.y > y) !== (vj.y > y)) && 
                (x < (vj.x - vi.x) * (y - vi.y) / (vj.y - vi.y) + vi.x)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    /**
     * Calculate bounds of the entire shape
     */
    calculateBounds() {
        if (this.coordinates.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        this.coordinates.forEach(coord => {
            const { topLeft, topRight, bottomLeft, bottomRight } = coord;
            
            minX = Math.min(minX, topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
            maxX = Math.max(maxX, topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
            minY = Math.min(minY, topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
            maxY = Math.max(maxY, topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
        });

        return { minX, maxX, minY, maxY };
    }
}