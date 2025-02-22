/**
 * a template for creating new recipe entries:
    {
        "title": "",
        "description": "",
        "permalink": "",
        "defaultServings": ,
        "servingUnits": "",
        "scalable": true, // required to see scaling UI
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
        "notes": [
            ""
        ],
    },

 */
export default [
    {
        "title": "Pork and lamb shepherd's pie",
        "description": "A hearty and savory dish full of meat and veggies",
        "permalink": "shepherds-pie",
        "defaultServings": 3,
        "servingUnits": "servings",
        "scalable": true, // required to see scaling UI
        "ingredients": [
            {
                'name': 'peas',
                'quantity': 0.3,
                'unit': 'bags'
            },
            {
                'name': 'carrots',
                'quantity': 0.5,
                'unit': 'bags'
            },
            {
                'name': 'tomato paste',
                'quantity': 12,
                'unit': 'oz'
            },
            {
                'name': 'onion',
                'quantity': 1,
                'unit': 'whole onion'
            },
            {
                'name': 'golden yukon potatoes',
                'quantity': 2,
                'unit': 'lbs'
            },
            {
                'name': 'lamb',
                'quantity': 1.5,
                'unit': 'lbs'
            },
        ],
        "steps": [
            "Preheat the oven to 350 degrees F.",
            "Boil water for the potatoes.",
            "Debone the lamb and cut into small pieces. Grind. Brown the meat in a large pot. Deglaze with the tomato paste. Set aside in a bowl.",
            "Chop the potatoes and start boiling them. Set a timer for 10 minutes, and check for doneness.",
            "Peel and chop the onion. Cook on medium high heat stirring infrequently until carmelized some. Place the onion in the bowl with the lamb.",
            "Assemble into a casserole dish or pie plate. Start with the lamb and onion mixture, then add the peas and carrots. Top with the mashed potatoes. Add shredded cheese if desired.",
            "Bake for 30 minutes, until the top is browned and the pie is heated through."
        ],
        "notes": [
            "Refrigerate leftovers for up to a week, or freeze for up to 3 months.",
            "This dish can be made with ground beef, turkey, or chicken instead of lamb.",
        ],
    },
    {
        "title": "Red Beet Pickled Eggs",
        "description": "A tangy and earthy breakfast, side or snack",
        "permalink": "red-beet-pickled-eggs",
        "defaultServings": 18,
        "servingUnits": "eggs",
        "scalable": true, 
        "ingredients": [
            {
                'name': 'beets',
                'quantity': 2,
                'unit': 'whole beets'
            },
            {
                'name': 'eggs',
                'quantity': 18,
                'unit': 'whole eggs'
            },
            {
                'name': 'white vinegar',
                'quantity': 1000,
                'unit': 'g'
            },
            {
                'name': 'sugar',
                'quantity': 500,
                'unit': 'g'
            },
            {
                'name': 'salt',
                'quantity': 2,
                'unit': 'tbsp'
            }
        ],
        "steps": [
            "Place eggs in a pot of cold water, and bring it to a boil on the stove, stirring frequently to keep the yolks centered. Once boiling, set a timer for 10 minutes.",
            "While the eggs are boiling, prepare an ice bath in a large bowl.",
            "Wash and slice the beets. Place them in a pot with the vinegar, sugar, and salt. Bring to a boil, then simmer for 10 minutes.",
            "Once the eggs are done, remove them from the pot and place them in the ice bath to cool.",
            "Peel the eggs and place them in a large jar or container, layered with the sliced beets.",
            "cover the eggs with the pickling liquid, and let them sit in the fridge for at least 24 hours before eating."
        ],
        "notes": [
            "For best results, let the eggs sit in the pickling liquid for at least 3 days before eating.",
            "Serve with a hefty sprinkle of salt, or slice and serve on a salad or sandwich."
        ],
    },
    {
        "title": "Honey Wheat Sandwich Bread",
        "description": "A soft, slightly sweet loaf, but slighly dense loaf made with 100% freshly milled hard red wheat",
        "permalink": "honey-wheat-sandwich-bread",
        "defaultServings": 2,
        "servingUnits": "loaves",
        "scalable": true, // required to see scaling UI
        "ingredients": [
            {
                'name': 'Hard Red Wheat Berries',
                'quantity': 500,
                'unit': 'g'
            },
            {
                'name': 'Filtered Water',
                'quantity': 385,
                'unit': 'g'
            },
            {
                'name': 'Honey',
                'quantity': 85,
                'unit': 'g'
            },
            {
                'name': 'Butter or Oil',
                'quantity': 28,
                'unit': 'g'
            },
            {
                'name': 'Salt',
                'quantity': 1.5,
                'unit': 'tsp'
            },
            {
                'name': 'Instant Yeast',
                'quantity': 2,
                'unit': 'tsp'
            },
        ],
        "steps": [
            "Mill the wheat berries into flour",
            "Mix all ingredients EXCEPT the yeast in a stand mixer until a shaggy dough forms. Let rest for 15 minutes, up to a couple hours.",
            "Add the yeast and knead the dough until it passes the windowpane test. This can take a while in your stand mixer, over 20 minutes.",
            "Place the dough in a greased bowl, cover, and let rise until doubled in size (~1 hour).",
            "Punch down the dough and shape into loaves. Place in greased loaf pans, cover, and let rise again until the dough is about an inch above the pan (~40 minutes).",
            "Preheat the oven to 350 degrees F. Bake the loaves for 30-40 minutes, until the internal temperature is 190 degrees F.",
            "Remove the loaves from the oven and let cool in the pans for 5 minutes. Remove from pans and cool on a wire rack."
        ],
        "notes": [
            "Store the bread in an unsealed plastic or paper bag at room temperature for up to a week, or freeze sealed in a plastic bag for up to 3 months.",
            "This bread can be dressed up with an oat topping, or inclusions like raisins, walnuts, or other dried fruits and nuts.",
            "To make rainbow bread, divide the dough into 6 parts and color each with food coloring before shaping and baking. I use Wilton gel food dye, using 5 toothpicks of red, orange and yellow, and 3 toothpicks of green, blue and purple.",
            "For a lighter loaf, substitute 1/3 of the whole wheat flour with bread flour.",
        ],
    },
    {
        "title": "Bacon Wrapped Turkey Breast",
        "description": "A very tender turkey breast",
        "permalink": "sous-vide-turkey-breast",
        "defaultServings": 1,
        "servingUnits": "breast",
        "scalable": false,
        "ingredients": [
            {
                'name': 'Butterball or similar Turkey Breast',
                'quantity': 5,
                'unit': 'Lbs'
            },
            {
                'name': 'Bacon',
                'quantity': 1,
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
        "title": "Old Bay-con Popcorn",
        "description": "A snack with a delicious savory umami, and a spicy tang",
        "permalink": "old-bay-pop",
        "defaultServings": 2,
        "servingUnits": "servings",
        "scalable": true,
        "ingredients": [
            {
                'name': 'Baby White Popcorn',
                'quantity': 130,
                'unit': 'g'
            },
            {
                'name': 'Rendered Bacon Fat',
                'quantity': 1,
                'unit': 'Tbsp'
            },
            {
                'name': 'Butter',
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
                'unit': 'tbsp'
            },
        ],
        "steps": [
            "Place a deep pan on the stove with a lid. Put 2 popcorn kernels in the pan with the bacon fat over medium high heat. Cover and let the kernels pop undisturbed.",
            "Once the two 'canary kernels' have popped, remove the pan from heat and add the remaining kernels. Cover. Coat all kernels in oil and place back on heat, this time just medium.",
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
        "scalable": true,
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