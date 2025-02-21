import { Trapezoid, Gauge, Panel } from '../src/knitting.ai.js';

const testTrapezoidData = {
    "height": 4,
    "baseA": 22,
    "baseB": 22,
    "finishingType": "Hang hem",
    "divisibleBy": 4,
    "successors": [
        {
            "height": 10,
            "baseA": 22,
            "baseB": 22,
            "finishingSteps": ["Hang hem."],
            "successors": [
                {"height": 3.4, "baseA": 5.5, "baseB": 0.2},
                {"height": 3.4, "baseA": 5.5, "baseB": 0.2},
                {"height": 3.4, "baseA": 5.5, "baseB": 0.2},
                {"height": 3.4, "baseA": 5.5, "baseB": 0.2},
            ]
        }
    ]
};

const gauge = new Gauge(19, 30);
const sizeModifier = 1;

const testTrapezoid = Trapezoid.fromJSON(testTrapezoidData);
const panel = new Panel(testTrapezoid, gauge, sizeModifier);

const instructions = panel.generateKnittingInstructions();

console.log(instructions);

const expectedInstructions = [
    "Cast on 104 stitches L52->R52.",
    "Knit 30 rows from L52 to R52 (Rows 1-30).",
    "Hang hem.",
    "Knit 75 rows from L52 to R52 (Rows 31-105).",
    "Put L52->R26 on hold.",
    "Knit 26 rows from R27 to R52, decreasing 1 stitch on both sides every 2 rows (Rows 106-131).",
    "Bind off 1 stitch, R38.",
    "Put L52->L1 on hold.",
    "Knit 26 rows from R1 to R26, decreasing 1 stitch on both sides every 2 rows (Rows 132-157).",
    "Bind off 1 stitch, R13.",
    "Put L52->L27 on hold.",
    "Knit 26 rows from L26 to L1, decreasing 1 stitch on both sides every 2 rows (Rows 158-183).",
    "Bind off 1 stitch, L13.",
    "Knit 26 rows from R1 to R26, decreasing 1 stitch on both sides every 2 rows (Rows 184-209).",
    "Bind off 1 stitch, L38.",
];

console.assert(JSON.stringify(instructions) === JSON.stringify(expectedInstructions), 'Test failed');
