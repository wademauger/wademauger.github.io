export default [
    {
        "permalink": "cozy-raglan-sweater",
        "title": "Cozy Raglan Sweater",
        "description": "A simple sweater with Raglan sleeves",
        "shapes": {
            "Front": {
                "height": 20,
                "baseA": 25,
                "baseB": 25,
                "successors": [
                    {"height": 8, "baseA": 5, "baseB": 3},
                    {"height": 0, "baseA": 2, "baseB": 2},
                    {"height": 8, "baseA": 5, "baseB": 3},
                ]
            },
            "Back": {
                "height": 20,
                "baseA": 25,
                "baseB": 25,
                "successors": [
                    {"height": 8, "baseA": 12, "baseB": 10},
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
                "stitchPattern": "stockinette-hem",
                "successors": [
                    {
                    "height": 10,
                    "baseA": 22,
                    "baseB": 22,
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