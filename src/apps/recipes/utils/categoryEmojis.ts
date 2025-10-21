// Recipe category emoji mappings
export const RECIPE_CATEGORY_EMOJIS = {
  // Standard recipe categories
  'dinners': '🍽️',
  'dinner': '🍽️',
  'mains': '🍽️',
  'main': '🍽️',
  'entrees': '🍽️',
  'entree': '🍽️',
  
  'desserts': '🍰',
  'dessert': '🍰',
  'sweets': '🍭',
  'treats': '🧁',
  'cakes': '🎂',
  'cookies': '🍪',
  
  'sides': '🥗',
  'side': '🥗',
  'sidedishes': '🥗',
  'vegetables': '🥬',
  'veggies': '🥬',
  
  'breads': '🍞',
  'bread': '🍞',
  'baking': '🥖',
  'pastries': '🥐',
  'rolls': '🥖',
  
  'breakfast': '🥞',
  'brunch': '🥞',
  'morning': '🌅',
  
  'lunch': '🥪',
  'sandwiches': '🥪',
  'wraps': '🌯',
  
  'appetizers': '🥨',
  'appetizer': '🥨',
  'apps': '🥨',
  'starters': '🍤',
  'snacks': '🍿',
  
  'soups': '🍲',
  'soup': '🍲',
  'stews': '🥘',
  'stew': '🥘',
  
  'salads': '🥗',
  'salad': '🥗',
  
  'drinks': '🥤',
  'beverages': '☕',
  'cocktails': '🍹',
  'smoothies': '🥤',
  
  'pasta': '🍝',
  'noodles': '🍜',
  'italian': '🇮🇹',
  
  'pizza': '🍕',
  'burgers': '🍔',
  'tacos': '🌮',
  'mexican': '🇲🇽',
  
  'asian': '🥢',
  'chinese': '🥡',
  'japanese': '🍱',
  'thai': '🍛',
  'indian': '🍛',
  
  'seafood': '🐟',
  'fish': '🐟',
  'shrimp': '🍤',
  
  'meat': '🥩',
  'beef': '🥩',
  'chicken': '🍗',
  'pork': '🐷',
  
  'vegetarian': '🌱',
  'vegan': '🌿',
  'healthy': '💚',
  
  'holiday': '🎄',
  'christmas': '🎄',
  'thanksgiving': '🦃',
  'easter': '🐰',
  
  // Google Drive recipes
  'google drive recipes': '📄',
  'drive': '📄',
  'cloud': '☁️',
  
  // Default fallback
  'default': '🍽️'
};

/**
 * Get emoji for a recipe category
 * @param {string} categoryName - The category name (case insensitive)
 * @returns {string} The emoji for the category
 */
export const getCategoryEmoji = (categoryName: string) => {
  if (!categoryName) return RECIPE_CATEGORY_EMOJIS.default;
  
  const normalized = categoryName.toLowerCase().trim();
  return RECIPE_CATEGORY_EMOJIS[normalized as keyof typeof RECIPE_CATEGORY_EMOJIS] || RECIPE_CATEGORY_EMOJIS.default;
};

/**
 * Get all available category names that have emojis
 * @returns {string[]} Array of category names
 */
export const getAvailableCategories = () => {
  return Object.keys(RECIPE_CATEGORY_EMOJIS).filter((key: any) => key !== 'default');
};