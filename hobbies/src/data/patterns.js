export default [
    {
        "permalink": "test-square",
        "title": "Test shape: 4x4 gauge swatch",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 4,
                "baseA": 4,
                "baseB": 4,
                "successors": []
            }
        }
    }, {
        "permalink": "test-square-ii",
        "title": "Test shape: 15x15 gauge swatch",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 15,
                "baseA": 15,
                "baseB": 15,
                "successors": []
            }
        }
    }, {
        "permalink": "test-rectangle",
        "title": "Test shape: rectangle",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 10,
                "baseA": 25,
                "baseB": 25,
                "successors": []
            }
        }
    }, {
        "permalink": "test-trapezoid",
        "title": "Test shape: isosceles trapezoid",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 20,
                "baseA": 30,
                "baseB": 20,
                "successors": []
            }
        }
    }, {
        "permalink": "test-trapezoid-iii",
        "title": "Test shape: wide, short trapezoid",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 4,
                "baseA": 2,
                "baseB": 30,
                "successors": []
            }
        }
    }, {
        "permalink": "test-trapezoid-iv",
        "title": "Test shape: tall, narrow trapezoid",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 60,
                "baseA": 2,
                "baseB": 10,
                "successors": []
            }
        }
    }, {
        "permalink": "test-trapezoid-ii",
        "title": "Test shape: slanted trapezoid",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 20,
                "baseA": 20,
                "baseB": 20,
                "baseBHorizontalOffset": 10,
                "successors": []
            }
        }
    }, {
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
        }
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
    }
];