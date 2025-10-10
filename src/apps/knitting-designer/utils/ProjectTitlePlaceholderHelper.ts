// Project inspiration generator :)

// Descriptors: moods, tactile feelings, whimsical adjectives
const descriptors: string[] = [
  "Warm", "Fuzzy", "Soft", "Cozy", "Snug", "Bright", "Cheerful", "Playful",
  "Chunky", "Shiny", "Sparkly", "Colorful", "Gentle", "Wild", "Flowing",
  "Vintage", "Sleek", "Airy", "Happy", "Glimmering", "Dreamy", "Fluffy",
  "Twinkling", "Rustic", "Breezy", "Sunny", "Shimmering", "Bold", "Tiny",
  "Soft-Spun", "Airy-Light", "Whimsical", "Rustling", "Snowy", "Misty",
  "Golden", "Silky", "Vibrant", "Cheery", "Radiant", "Peaceful", "Gleaming",
  "Moonlit", "Twisty", "Gentle-Touch", "Playful-Puff", "Delicate", "Frosted",
  "Dappled", "Cuddly", "Squishy", "Cozy-Warm", "Lively"
];

// Kinds: patterns, textures, stitch types, yarn styles, size descriptors
const kinds: string[] = [
  "Cabled", "Ribbed", "Lacy", "Striped", "Textured", "Chunky", "Fine", 
  "Airy", "Dense", "Openwork", "Woven", "Twisted", "Braided", "Bobble", 
  "Frilly", "Marled", "Variegated", "Soft-Spun", "Thick", "Delicate", "Wavy", 
  "Looped", "Honeycomb", "Herringbone", "Chevron", "Zigzag", "Basketweave",
  "Feathered", "Gossamer", "Pleated", "Knotted", "Ruffled", "Shaggy", 
  "Nubbly", "Pointelle", "Fair-Isle", "Entrelac", "Slubbed", "Twined", 
  "Crocheted", "Tasselled", "Textured-Twist", "Moss-Stitch", "Seed-Stitch",
  "Diamond", "Hollow", "Corded", "Rib-Twist", "Looped-Bobble", "Lattice"
];

// Projects: knittable items
const projects: string[] = [
  "Sweater", "Hat", "Scarf", "Mittens", "Socks", "Blanket", "Shawl", 
  "Cardigan", "Tunic", "Wrap", "Poncho", "Gloves", "Cowl", "Vest", "Cap", 
  "Pullover", "Hoodie", "Mitts", "Top", "Jumper", "Beanie", "Beret", "Stole",
  "Throw", "Boa", "Neckwarmer", "Headband", "Slippers", "Handwarmers",
  "Kimono", "Poncholet", "Shrug", "Baby-Blanket", "Baby-Sweater", "Ankle-Socks",
  "Legwarmers", "Fingerless-Gloves", "Earwarmers", "Afghan", "Pillow-Cover",
  "Toy", "Doll-Clothes", "Table-Runner", "Coaster", "Placemat", "Wall-Hanging",
  "Bag", "Pouch", "Shawlette", "Capelet", "Boot-Toppers"
];

// Function to get a random element from an array
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to generate a placeholder title
export function generateProjectTitle(): string {
  const descriptor = randomFromArray(descriptors);
  const kind = randomFromArray(kinds);
  const project = randomFromArray(projects);
  return `${descriptor} ${kind} ${project}`;
}
