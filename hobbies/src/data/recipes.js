/**
 * a template for creating new recipe entries:
    {
        "title": "",
        "description": "",
        "permalink": "",
        "defaultServings": ,
        "servingUnits": "",
        "ingredients": [
            {
                'name': '',
                'quantity': ,
                'unit': ''
            },
        ],
        "steps": [
            ""
        ],
        "notes": [],
    },

 */
export default [
    {
        "title": "Turkey Breast Sous Vide",
        "description": "One of the juciest and most tender Turkies ever!",
        "permalink": "sous-vide-turkey-breast",
        "defaultServings": 5,
        "servingUnits": "servings",
        "ingredients": [
            {
                'name': 'Butterball or similar Turkey Breast',
                'quantity': 5,
                'unit': 'Lbs'
            },
            {
                'name': 'Garlic Powder',
                'quantity': undefined,
                'unit': 'to taste'
            },
            {
                'name': 'Pepper',
                'quantity': undefined,
                'unit': 'to taste'
            },
            {
                'name': 'Salt',
                'quantity': undefined,
                'unit': 'to taste'
            },
        ],
        "steps": [
            "Setup a sous vide water bath at 145 degrees F",
            "Unpackage the turkey breast. Pat it dry, rub it with spices to taste, and place it in a ziploc bag, using the immersion method to remove most of the air so the breast will sink.",
            "Cook the breast in the bath for 3 hours",
            "Remove the breast from the bath. Pan sear the surface to brown the skin and meat."
        ],
        "notes": ["Substitute Garlic Powder with Old Bay or Mrs. Dash for different flavors"],
    },
    {
        "title": "Old Bay Popcorn",
        "description": "A healthy snack with a crabby tang",
        "permalink": "old-bay-pop",
        "defaultServings": 4,
        "servingUnits": "servings",
        "ingredients": [
            {
                'name': 'Baby White Popcorn',
                'quantity': 4,
                'unit': 'oz'
            },
            {
                'name': 'Coconut Oil',
                'quantity': 1,
                'unit': 'Tbsp'
            },
            {
                'name': 'Flake salt',
                'quantity': 2,
                'unit': 'tsp'
            },
            {
                'name': 'Old Bay',
                'quantity': 2,
                'unit': 'tsp'
            },
        ],
        "steps": [
            "Place a deep pan on the stove with a lid. Put 2 popcorn kernels in the pan with the oil over medium heat. Cover and let the kernels pop undisturbed.",
            "Once the two 'canary kernels' have popped, remove the pan from heat and add the remaining kernels. Cover. Coat all kernels in oil and place back on heat",
            "When the kernels start popping again, shake the pan gently. Once popping slows, remove from heat and continue shaking until kernels stop popping",
            "Drizzle with melted butter and toss with flake salt and Old Bay seasoning to taste."
        ],
        "notes": [],
    },
    {
        "title": "Halupki Casserole",
        "description": "An easy, balanced and hearty dish",
        "permalink": "halupki-casserole",
        "defaultServings": 4,
        "servingUnits": "servings",
        "ingredients": [
            {
                'name': 'Green Cabbage',
                'quantity': 1,
                'unit': 'cabbages'
            },
            {
                'name': 'Ground Meat',
                'quantity': 1,
                'unit': 'Lbs'
            },
            {
                'name': 'Worstershire Sauce',
                'quantity': 1,
                'unit': 'Tbsp'
            },
            {
                'name': 'Tomato Paste',
                'quantity': 1,
                'unit': 'small can'
            },
            {
                'name': 'Sweet Onion',
                'quantity': 1,
                'unit': 'onions'
            },
            {
                'name': 'Garlic',
                'quantity': 6,
                'unit': 'cloves'
            },
            {
                'name': 'Uncooked Rice',
                'quantity': 1,
                'unit': 'cup'
            },
        ],
        "steps": [
            "Preheat the oven to 350.",
            "Brown the ground meat. Drain it and set it aside.",
            "Chop the onions and saute with a little oil. Add garlic once onions are almost finished. Remove from heat.",
            "Peel some of the bigger leaves from the cabbage and set aside. Chop the remaining cabbage, and fry in the pan with a little oil.",
            "Mix the meat with the garlic, onions, and fried shredded cabbage.",
            "Place the uncooked rice in the bottom of a casserole dish. Pile with the meat mixture, then add a cup of water or so.",
            "Cover with the cabbage leaves set aside from earlier, and then cover with foil and place in the hot oven. Set a timer for 30 minutes.",
            "After 30 minutes, uncover. Bake another 5-10 minutes to brown the cabbage on top and set up the rice if it still has too much water."
        ],
        "notes": [],
    },
]