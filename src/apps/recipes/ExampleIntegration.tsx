import React, { useState, useEffect } from 'react';
import { Space, message } from 'antd';
import AddRecipeModal from './components/AddRecipeModal';
import GoogleDriveRecipeService from './services/GoogleDriveRecipeService';

// Example of how to integrate the AddRecipeModal into your existing RecipesApp component

const ExampleRecipesAppIntegration = () => {
  // Use the singleton instance instead of creating a new one
  const [googleDriveService] = useState(() => GoogleDriveRecipeService);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Initialize the service
    const initializeService = async () => {
      try {
        // Replace with your actual Google Client ID
        await googleDriveService.initialize('YOUR_GOOGLE_CLIENT_ID');
        const signInStatus = googleDriveService.getSignInStatus();
        
        if (signInStatus.isSignedIn) {
          loadRecipes();
        }
      } catch (error: unknown) {
        console.error('Failed to initialize Google Drive service:', error);
        message.error('Failed to initialize Google Drive service');
      }
    };

    initializeService();
  }, []);

  const loadRecipes = async () => {
    try {
      const library = await googleDriveService.loadRecipeLibrary();
      setRecipes(library.recipes || []);
    } catch (error: unknown) {
      console.error('Failed to load recipes:', error);
      message.error('Failed to load recipes');
    }
  };

  const handleRecipeAdded = (newRecipe) => {
    // Add the new recipe to the local state
    setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
    
    // Optionally reload all recipes to ensure consistency
    // loadRecipes();
  };

  // Replace your existing "Add Recipe" button with this:
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>My Recipes</h1>
        <Space>
          {/* Replace your old add recipe button with this */}
          <AddRecipeModal 
            googleDriveService={googleDriveService}
            onRecipeAdded={handleRecipeAdded}
          />
        </Space>
      </div>

      {/* Your existing recipe display code */}
      <div>
        {recipes.length === 0 ? (
          <p>No recipes yet. Create your first recipe!</p>
        ) : (
          <div>
            {recipes.map(recipe => (
              <div key={recipe.id} style={{ 
                border: '1px solid #ddd', 
                padding: '16px', 
                marginBottom: '16px',
                borderRadius: '8px'
              }}>
                <h3>{recipe.title}</h3>
                <p><strong>Permalink:</strong> {recipe.permalink}</p>
                <p><strong>Created:</strong> {new Date(recipe.created).toLocaleDateString()}</p>
                {recipe.description && <p>{recipe.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleRecipesAppIntegration;
