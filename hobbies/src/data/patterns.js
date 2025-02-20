export default [
    {
        "permalink": "test-square",
        "title": "Test shape: square",
        "description": "test",
        "shapes": {
            "Front": {
                "height": 30,
                "baseA": 30,
                "baseB": 30,
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
        "title": "Cozy Raglan Sweater",
        "description": "A simple sweater with Raglan sleeves",
        "shapes": {
            "Front": {
                "height": 20,
                "baseA": 25,
                "baseB": 25,
                "successors": [
                    {"height": 0, "baseA": 1, "baseB": 1},
                    {"height": 8, "baseA": 10, "baseB": 3},
                    {"height": 0, "baseA": 2, "baseB": 2},
                    {"height": 8, "baseA": 10, "baseB": 3},
                    {"height": 0, "baseA": 1, "baseB": 1},
                ]
            },
            "Back": {
                "height": 20,
                "baseA": 25,
                "baseB": 25,
                "successors": [
                    {"height": 0, "baseA": 1, "baseB": 1},
                    {"height": 8, "baseA": 23, "baseB": 15},
                    {"height": 0, "baseA": 1, "baseB": 1},
                ]
            },
            "Sleeves (make 2)": {
                "height": 4,
                "baseA": 10,
                "baseB": 10,
                "successors": [
                    {"height": 14, "baseA": 10, "baseB": 20, "successors": [
                        {"height": 7, "baseA": 20, "baseB": 3 }
                    ]},
                ]
            }
        }
    }, {
        "permalink": "seam-top-hat",
        "title": "Seam-Top Hat",
        "description": "A simple hat with an elegant construction",
        "shapes": {
            "Hat": {
                "height": 4,
                "baseA": 22,
                "baseB": 22,
                "successors": [
                    {
                    "height": 10,
                    "baseA": 22,
                    "baseB": 22,
                    "finishingSteps": ["Hang hem."],
                    "successors": [
                            {"height": 4, "baseA": 5.5, "baseB": 0.2},
                            {"height": 4, "baseA": 5.5, "baseB": 0.2},
                            {"height": 4, "baseA": 5.5, "baseB": 0.2},
                            {"height": 4, "baseA": 5.5, "baseB": 0.2},
                        ]
                    }
                ]
            }
        }
    }
];