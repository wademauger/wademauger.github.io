export default [
    {
        "permalink": "cozy-raglan-sweater",
        "title": "Cozy Raglan Sweater",
        "description": "A simple sweater with Raglan sleeves.",
        "shapes": {
            "Front": {
                "height": 10,
                "baseA": 9,
                "baseB": 12,
                "successors": [
                    {"height": 0, "baseA": 1, "baseB": 1},
                    {"height": 4, "baseA": 4, "baseB": 3},
                    {"height": 0, "baseA": 2, "baseB": 2},
                    {"height": 4, "baseA": 4, "baseB": 3},
                    {"height": 0, "baseA": 1, "baseB": 1},
                ]
            },
            "Back": {
                "height": 10,
                "baseA": 9,
                "baseB": 12,
                "successors": [
                    {"height": 4, "baseA": 12, "baseB": 3},
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