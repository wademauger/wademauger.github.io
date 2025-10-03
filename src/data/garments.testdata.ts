export default [
    {
        'title': 'Test shape: 4x4 gauge swatch',
        'shapes': {
            'height': 4,
            'baseA': 4,
            'baseB': 4,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 19 stitches.',
            'Knit 30 rows (RC=30, 19 sts in work).',
            'Bind off 19 stitches.'
        ]
    }, {
        'title': 'Test shape: 15x15 gauge swatch',
        'shapes': {
            'height': 15,
            'baseA': 15,
            'baseB': 15,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 72 stitches.',
            'Knit 114 rows (RC=114, 72 sts in work).',
            'Bind off 72 stitches.'
        ]
    }, {
        'title': 'Test shape: rectangle',
        'shapes': {
            'height': 10,
            'baseA': 25,
            'baseB': 25,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 120 stitches.',
            'Knit 76 rows (RC=76, 120 sts in work).',
            'Bind off 120 stitches.'
        ]
    }, {
        'title': 'Test shape: isosceles trapezoid',
        'shapes': {
            'height': 20,
            'baseA': 30,
            'baseB': 20,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 144 stitches.',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=7, 142 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=13, 140 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=19, 138 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=26, 136 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=32, 134 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=38, 132 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=45, 130 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=51, 128 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=57, 126 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=64, 124 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=70, 122 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=76, 120 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=83, 118 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=89, 116 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=95, 114 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=102, 112 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=108, 110 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=114, 108 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=121, 106 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=127, 104 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=133, 102 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 7 rows. (RC=140, 100 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=146, 98 sts in work)',
            'Decrease 1 stitch on the left. Decrease 1 stitch on the right. Knit 6 rows. (RC=152, 96 sts in work)',
            'Bind off 96 stitches.'
        ]
    }, {
        'title': 'Test shape: wide, short trapezoid',
        'shapes': {
            'height': 2,
            'baseA': 2,
            'baseB': 30,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 18 stitches.',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 2 rows. (RC=2, 26 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=3, 36 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=4, 44 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=5, 54 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=6, 62 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=7, 72 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=8, 80 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=9, 90 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=10, 98 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=11, 108 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=12, 116 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=13, 126 sts in work)',
            'Increase 4 stitches on the left. Increase 4 stitches on the right. Knit 1 row. (RC=14, 134 sts in work)',
            'Increase 5 stitches on the left. Increase 5 stitches on the right. Knit 1 row. (RC=15, 144 sts in work)',
            'Bind off 144 stitches.'
        ]
    }, {
        'title': 'Test shape: tall, narrow trapezoid',
        'shapes': {
            'height': 60,
            'baseA': 2,
            'baseB': 10,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 10 stitches.',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=24, 12 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=48, 14 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=72, 16 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=96, 18 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=120, 20 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=144, 22 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=168, 24 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=192, 26 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=216, 28 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=240, 30 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=264, 32 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=288, 34 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=312, 36 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=336, 38 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=360, 40 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=384, 42 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=408, 44 sts in work)',
            'Increase 1 stitch on the left. Increase 1 stitch on the right. Knit 24 rows. (RC=432, 46 sts in work)',
            'Bind off 46 stitches.'
        ]
    }, {
        'title': 'Test shape: stacked squares',
        'shapes': {
            'height': 5,
            'baseA': 5,
            'baseB': 5,
            'successors': [{
                'height': 5,
                'baseA': 5,
                'baseB': 5,
                'successors': [{
                    'height': 5,
                    'baseA': 5,
                    'baseB': 5
                }]
            }]
        },
        'expectInstructions': [
            'Cast on 24 stitches.',
            'Knit 38 rows (RC=38, 24 sts in work).',
            'Knit 38 rows (RC=76, 24 sts in work).',
            'Knit 38 rows (RC=114, 24 sts in work).',
            'Bind off 24 stitches.'
        ]
    }, {
        'title': 'Test shape: slanted trapezoid',
        'shapes': {
            'height': 20,
            'baseA': 20,
            'baseB': 20,
            'baseBHorizontalOffset': 10,
            'successors': []
        },
        'expectInstructions': [
            'Cast on 96 stitches.',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=4, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=7, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=10, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=13, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=16, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=20, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=23, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=26, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=29, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=32, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=35, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=39, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=42, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=45, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=48, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=51, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=54, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=58, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=61, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=64, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=67, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=70, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=73, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=77, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=80, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=83, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=86, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=89, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=92, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=96, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=99, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=102, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=105, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=108, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=111, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=115, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=118, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=121, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=124, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=127, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=130, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 4 rows. (RC=134, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=137, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=140, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=143, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=146, 96 sts in work)',
            'Decrease 1 stitch on the left. Increase 1 stitch on the right. Knit 3 rows. (RC=149, 96 sts in work)',
            'Bind off 96 stitches.'
        ]
    }
];