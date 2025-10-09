import polygonClipping from 'polygon-clipping';

// Define types for points, polygons, and trapezoids
type Point = [number, number];
type Ring = Point[]; // a closed path (first and last may or may not repeat)
type PCPolygon = Ring[]; // first ring is outer, subsequent rings are holes
type PCMultiPolygon = PCPolygon[]; // union may produce multiple disjoint polygons
type Trapezoid = Point[];

interface Panel {
    trapezoids: Trapezoid[];
    // Other panel properties
}

interface Gauge {
    gaugeX: number;
    gaugeY: number;
}

/**
 * Renders a knitting panel on a canvas.
 * @param ctx The CanvasRenderingContext2D to render on.
 * @param panel The panel to render.
 * @param gauge The knitting gauge.
 * @param fillColor The color to fill the panel with.
 * @param borderColor The color of the border.
 */
export function renderPanel(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    gauge: Gauge,
    fillColor: string,
    borderColor: string
) {
    // 1. Construct trapezoid paths in local coordinates.
    const trapezoidPolygons: PCPolygon[] = panel.trapezoids.map(t => [t]);

    // 2. Merge all trapezoid paths into a single polygon outline.
    let merged: PCMultiPolygon | null = null;
    if (trapezoidPolygons.length > 0) {
        // polygon-clipping can union multiple inputs at once
        merged = (polygonClipping as any).union(...trapezoidPolygons) as PCMultiPolygon;
    }

    if (!merged || merged.length === 0) {
        return;
    }

    // 3. Fill the merged outline(s) with the main color.
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    for (const poly of merged) {
        for (let r = 0; r < poly.length; r++) {
            const ring = normalizeClosedRing(poly[r]);
            if (ring.length === 0) continue;
            ctx.moveTo(ring[0][0], ring[0][1]);
            for (let i = 1; i < ring.length; i++) {
                ctx.lineTo(ring[i][0], ring[i][1]);
            }
            ctx.closePath();
        }
    }
    ctx.fill('evenodd');

    // Choose the largest outer ring to compute the border offset.
    let largestOuterRing: Ring | null = null;
    let largestArea = -Infinity;
    for (const poly of merged) {
        if (!poly[0]) continue;
        const ring = normalizeClosedRing(poly[0]);
        const area = Math.abs(signedArea(ring));
        if (area > largestArea) {
            largestArea = area;
            largestOuterRing = ring;
        }
    }

    if (!largestOuterRing || largestOuterRing.length < 3) return;

    // 4. Compute an inward offset version of the polygon using gauge-scaled segment thickness.
    const offsetPolygon = computeInwardOffset(largestOuterRing, gauge);

    // 5. Fill the area between the original polygon and the inward offset path with the border color.
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    // Outer path (largest ring)
    ctx.moveTo(largestOuterRing[0][0], largestOuterRing[0][1]);
    for (let i = 1; i < largestOuterRing.length; i++) {
        ctx.lineTo(largestOuterRing[i][0], largestOuterRing[i][1]);
    }
    ctx.closePath();

    // Inner path (offset) - reverse order to create a hole
    ctx.moveTo(offsetPolygon[0][0], offsetPolygon[0][1]);
    for (let i = offsetPolygon.length - 1; i >= 0; i--) {
        ctx.lineTo(offsetPolygon[i][0], offsetPolygon[i][1]);
    }
    ctx.closePath();

    ctx.fill('evenodd');
}

function computeInwardOffset(polygon: Point[], gauge: Gauge): Point[] {
    const newPoints: Point[] = [];
    const len = polygon.length;

    for (let i = 0; i < len; i++) {
        const p_prev = polygon[(i + len - 1) % len];
        const p_curr = polygon[i];
        const p_next = polygon[(i + 1) % len];

        // Line 1: p_prev -> p_curr
        const angle1 = Math.atan2(p_curr[1] - p_prev[1], p_curr[0] - p_prev[0]);
        const thickness1 = Math.sqrt(Math.pow(gauge.gaugeX * Math.cos(angle1), 2) + Math.pow(gauge.gaugeY * Math.sin(angle1), 2));
        const offset1 = thickness1 / 2;
        const n1: Point = [Math.sin(angle1), -Math.cos(angle1)];

        // Line 2: p_curr -> p_next
        const angle2 = Math.atan2(p_next[1] - p_curr[1], p_next[0] - p_curr[0]);
        const thickness2 = Math.sqrt(Math.pow(gauge.gaugeX * Math.cos(angle2), 2) + Math.pow(gauge.gaugeY * Math.sin(angle2), 2));
        const offset2 = thickness2 / 2;
        const n2: Point = [Math.sin(angle2), -Math.cos(angle2)];

        // Offset points for the two lines
        const p1_offset: Point = [p_curr[0] - n1[0] * offset1, p_curr[1] - n1[1] * offset1];
        const p2_offset: Point = [p_curr[0] - n2[0] * offset2, p_curr[1] - n2[1] * offset2];

        // Direction vectors of the original lines
        const d1: Point = [p_curr[0] - p_prev[0], p_curr[1] - p_prev[1]];
        const d2: Point = [p_next[0] - p_curr[0], p_next[1] - p_curr[1]];

        // Intersection of the two offset lines
        const det = d1[0] * d2[1] - d1[1] * d2[0];

        if (Math.abs(det) < 1e-6) { // Parallel or collinear lines
            // Fallback for collinear points, just offset the point along the average normal
            const avg_n: Point = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
            const avg_offset = (offset1 + offset2) / 2;
            newPoints.push([p_curr[0] - avg_n[0] * avg_offset, p_curr[1] - avg_n[1] * avg_offset]);
        } else {
            const t = ((p2_offset[0] - p1_offset[0]) * d2[1] - (p2_offset[1] - p1_offset[1]) * d2[0]) / det;
            const intersect: Point = [p1_offset[0] + t * d1[0], p1_offset[1] + t * d1[1]];
            newPoints.push(intersect);
        }
    }

    return newPoints;
}

function signedArea(ring: Ring): number {
    let area = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [x1, y1] = ring[j];
        const [x2, y2] = ring[i];
        area += (x1 * y2 - x2 * y1);
    }
    return area / 2;
}

function normalizeClosedRing(ring: Ring): Ring {
    if (ring.length === 0) return ring;
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) return ring.slice(0, -1);
    return ring;
}
