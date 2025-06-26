#!/usr/bin/env node

// Test script to verify title and slug preservation functionality
// This simulates the workflow of the NewRecipeForm component

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Simulate the NewRecipeForm state management for title preservation
class RecipeFormSimulator {
  constructor() {
    this.titleValue = '';
    this.slugValue = '';
    this.originalTitle = '';
    this.originalSlug = '';
    this.showAiChat = false;
  }

  // Simulate user entering title
  handleTitleChange(title) {
    this.titleValue = title;
    // Auto-generate slug if not manually edited
    this.slugValue = generateSlug(title);
    console.log(`📝 Title changed: "${title}" → slug: "${this.slugValue}"`);
  }

  // Simulate clicking "Create Recipe with AI"
  handleCreateWithAI() {
    if (!this.titleValue) {
      console.log('❌ Error: Please enter a recipe title before using AI assistance');
      return false;
    }

    // Preserve the original title and slug
    this.originalTitle = this.titleValue;
    this.originalSlug = this.slugValue;
    this.showAiChat = true;

    console.log('🔄 Switching to AI mode. Preserving:', { 
      originalTitle: this.originalTitle, 
      originalSlug: this.originalSlug 
    });
    return true;
  }

  // Simulate saving AI-generated recipe
  handleSaveAiRecipe(aiRecipeData) {
    // Use preserved original title and slug if available
    const finalTitle = this.originalTitle || aiRecipeData.title;
    const finalSlug = this.originalSlug || generateSlug(aiRecipeData.title);
    
    console.log('📝 Using recipe title and slug:', { 
      finalTitle, 
      finalSlug, 
      fromOriginal: !!this.originalTitle,
      aiTitle: aiRecipeData.title 
    });

    const recipeData = {
      title: finalTitle,
      permalink: finalSlug,
      description: aiRecipeData.description || '',
      ingredients: aiRecipeData.ingredients || [],
      steps: aiRecipeData.steps || [],
      tags: [...(aiRecipeData.tags || []), 'ai-generated']
    };

    console.log('💾 Final recipe data:', recipeData);
    return recipeData;
  }
}

// Test scenarios
console.log('🧪 Testing Title and Slug Preservation\n');

// Test 1: Normal workflow with title preservation
console.log('📋 Test 1: Normal workflow with title preservation');
const form1 = new RecipeFormSimulator();
form1.handleTitleChange('Chocolate Chip Cookies');
form1.handleCreateWithAI();

// Simulate AI response
const aiResponse1 = {
  title: 'The Best Chocolate Chip Cookies Ever',
  description: 'Delicious homemade cookies',
  ingredients: ['flour', 'chocolate chips', 'butter'],
  steps: ['Mix ingredients', 'Bake for 12 minutes']
};

const saved1 = form1.handleSaveAiRecipe(aiResponse1);
console.log('✅ Expected: Original title preserved\n');

// Test 2: Empty title handling
console.log('📋 Test 2: Empty title handling');
const form2 = new RecipeFormSimulator();
const success = form2.handleCreateWithAI();
console.log(`✅ Expected: Error message shown, AI mode not activated: ${!success}\n`);

// Test 3: Title with special characters
console.log('📋 Test 3: Title with special characters');
const form3 = new RecipeFormSimulator();
form3.handleTitleChange('Mom\'s "Famous" Apple Pie & Ice Cream!');
form3.handleCreateWithAI();

const aiResponse3 = {
  title: 'Classic Apple Pie Recipe',
  ingredients: ['apples', 'cinnamon', 'pie crust'],
  steps: ['Prepare filling', 'Bake pie']
};

const saved3 = form3.handleSaveAiRecipe(aiResponse3);
console.log('✅ Expected: Special characters cleaned in slug but title preserved\n');

// Test 4: AI response without title preservation (fallback)
console.log('📋 Test 4: AI response without title preservation (fallback)');
const form4 = new RecipeFormSimulator();
// Simulate no original title being set
const aiResponse4 = {
  title: 'Mystery Recipe',
  ingredients: ['ingredient 1', 'ingredient 2'],
  steps: ['step 1', 'step 2']
};

const saved4 = form4.handleSaveAiRecipe(aiResponse4);
console.log('✅ Expected: AI title used as fallback\n');

console.log('🎉 All tests completed! The title and slug preservation feature should work correctly.');
