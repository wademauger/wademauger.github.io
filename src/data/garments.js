import VisualMotif from '../models/VisualMotif';

const garments = [
    {
        "permalink": "cozy-raglan-sweater",
        "title": "Cozy Raglan V-Neck Sweater",
        "description": "A simple sweater with Raglan sleeves",
        "sizes": {
            "men's small / women's medium": 0.9,
            "men's medium / women's large": 1,
            "men's large / women's XL": 1.085,
        },
        "shapes": {
            "Front":
            {
                "height": 4,
                "baseA": 25,
                "baseB": 25,
                "finishingSteps": ["Hang hem."],
                "successors": [{
                    "height": 20,
                    "baseA": 25,
                    "baseB": 25,
                    "successors": [
                        { "height": 0, "baseA": 1, "baseB": 1 },
                        { "height": 8, "baseA": 10, "baseB": 3 },
                        { "height": 0, "baseA": 2, "baseB": 2 },
                        { "height": 8, "baseA": 10, "baseB": 3 },
                        { "height": 0, "baseA": 1, "baseB": 1 },
                    ]
                }],
            },
            "Back": {
                "height": 4,
                "baseA": 25,
                "baseB": 25,
                "finishingSteps": ["Hang hem."],
                "successors": [{
                    "height": 20,
                    "baseA": 25,
                    "baseB": 25,
                    "successors": [
                        { "height": 0, "baseA": 1, "baseB": 1 },
                        { "height": 8, "baseA": 23, "baseB": 15 },
                        { "height": 0, "baseA": 1, "baseB": 1 },
                    ],
                }],
            },
            "Sleeves (make 2)": {
                "height": 4,
                "baseA": 10,
                "baseB": 10,
                "successors": [
                    {
                        "height": 14, "baseA": 10, "baseB": 20, "successors": [
                            { "height": 7, "baseA": 20, "baseB": 3 }
                        ]
                    },
                ]
            }
        },
        "finishingSteps": [
            "Lay out the panels and sleeves, right sides together, and knit the collar in whatever style you prefer.",
            "Sew up the side seams and sleeve seams.",
            "Weave in all ends.",
        ]
    }, {
        "permalink": "seam-top-hat",
        "title": "Seam-Top Hat",
        "description": "A simple hat with an elegant construction",
        "sizes": {
            "One Size": 1,
        },
        "shapes": {
            "Hat": {
                "height": 4,
                "baseA": 22,
                "baseB": 22,
                "finishingSteps": ["Hang hem."],
                "successors": [
                    {
                        "height": 10,
                        "baseA": 22,
                        "baseB": 22,
                        "successors": [
                            { "height": 4, "baseA": 5.5, "baseB": 0.2 },
                            { "height": 4, "baseA": 5.5, "baseB": 0.2 },
                            { "height": 4, "baseA": 5.5, "baseB": 0.2 },
                            { "height": 4, "baseA": 5.5, "baseB": 0.2 },
                        ]
                    }
                ]
            }
        },
        "finishingSteps": ["Either use sew-as-you-go to join the top panels on the machine, or sew with a tapestry needle after binding off.", "Sew up the back seam.", "Add braided ear strings if desired."],
    }, {
        "permalink": "drop-shoulder-crew-neck-sweater",
        "title": "Drop-Shoulder Crew Neck Sweater",
        "description": "A cozy drop-shoulder sweater with a classic crew neck",
        "sizes": {
            "men's small / women's medium": 0.9,
            "men's medium / women's large": 1,
            "men's large / women's XL": 1.085,
        },
        "shapes": { // TODO: Shape the neckline/shoulders for this sweater
            "Front": {
                "height": 5,
                "baseA": 5,
                "baseB": 5,
                "successors": [{
                    "height": 5,
                    "baseA": 5,
                    "baseB": 5,
                    "successors": [{
                        "height": 5,
                        "baseA": 5,
                        "baseB": 5,
                    }]
                }],
            },
            "Back": {
                "height": 5,
                "baseA": 30,
                "baseB": 30,
                "finishingSteps": ["Hang hem."],
                "successors": [{
                    "height": 20,
                    "baseA": 30,
                    "baseB": 30,
                    "successors": [
                        { "height": 0, "baseA": 3, "baseB": 3 },
                        { "height": 10, "baseA": 10, "baseB": 10 },
                        { "height": 0, "baseA": 4, "baseB": 4 },
                        { "height": 10, "baseA": 10, "baseB": 10 },
                        { "height": 0, "baseA": 3, "baseB": 3 },
                    ],
                }],
            },
            "Sleeves (make 2)": {
                "height": 4,
                "baseA": 10,
                "baseB": 10,
                "successors": [
                    { "height": 20, "baseA": 10, "baseB": 21 },
                ]
            }
        }
    }
];

const colorworkCharts = {
    "Solid": [[0]],
    "Stripes_2x2": [[0, 0, 1, 1]],
    "Stripes_4x2": [[0, 0, 0, 0, 1, 1]],
    "Stripes_4x4": [[0, 0, 0, 0, 1, 1, 1, 1]],
    "Checkerboard": [
        [0, 1],
        [1, 0],
    ],
    "Checkerboard_4x4": [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [1, 1, 0, 0],
        [1, 1, 0, 0],
    ],
    "Arguyle": [
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
};

const visualMotifs = {
    /*
        {
            type: 'SOLID|STANDED|INTARSIA',
            primaryMotif: 'Stripes_4x2',
            secondaryMotifs: ['stripes_4x4'],
            defaultColors: ['#ffffff'],
            successor: null,
            truncatedBy: 0,
            horizontalRepeat: 5|undefined,
            verticalRepeat 10|undefined,
            height: 5|undefined, // if *motif* properties are defined, height is unused (infer from motifs+repeats)
        },
    */
    blackAndWhiteStripes: new VisualMotif({
        type: 'SOLID',
        defaultColors: ['#ffffff'],
        verticalRepeat: 10,
        height: 4,
        successor: {
            type: 'SOLID',
            defaultColors: ['#ffffff'],
            height: 2
        },
    }),
    redAndWhiteStripes: new VisualMotif({
        type: 'SOLID',
        defaultColors: ['#ff0000'],
        verticalRepeat: 10,
        height: 4,
        successor: {
            type: 'SOLID',
            defaultColors: ['#ffffff'],
            verticalRepeat: 10,
            height: 4
        },
    }),
    checkerboard: new VisualMotif({
        type: 'STRANDED',
        defaultColors: ['#ffffff', '#000000'],
        primaryMotif: 'Checkerboard',
        verticalRepeat: 4,
    }),
    argyle: new VisualMotif({
        type: 'INTARSIA',
        defaultColors: ['#ffffff', '#000000'],
        primaryMotif: 'Argyle',
    }),
    solidWhite: new VisualMotif({
        type: 'SOLID',
        defaultColors: ['#ffffff'],
        verticalRepeat: 10,
        height: 4,
    }),

};


export { garments, colorworkCharts, visualMotifs };