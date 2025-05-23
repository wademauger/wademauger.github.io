import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import ReaderView from './components/ReaderView';
import recipeLibrary from '../../data/recipes';
import './styles/RecipesApp.css';

const RecipesApp = ({ view = 'standard' }) => {
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [fontSize, setFontSize] = useState(100); // Font size in percentage
  const urlPermalink = useParams().recipeId;
  const navigate = useNavigate();
  
  useEffect(() => {
    setRecipes(recipeLibrary);
    
    // Find recipe across all sections when URL permalink changes
    if (urlPermalink && Object.keys(recipeLibrary).length > 0) {
      // Helper function to find a recipe by permalink across all sections
      const findRecipeByPermalink = (permalink) => {
        for (const section in recipeLibrary) {
          const foundRecipe = recipeLibrary[section].find(r => r.permalink === permalink);
          if (foundRecipe) {
            return foundRecipe;
          }
        }
        return null;
      };
      
      const recipe = findRecipeByPermalink(urlPermalink);
      if (recipe) {
        setActiveRecipe(recipe);
      }
    }
  }, [urlPermalink]);

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
  };

  const handleRecipeSelect = (recipe) => {
    navigate(`/recipes/${recipe.permalink}`);
  };

  const toggleReaderView = () => {
    if (activeRecipe) {
      if (view === 'reader') {
        navigate(`/recipes/${activeRecipe.permalink}`);
      } else {
        navigate(`/recipes/reader-view/${activeRecipe.permalink}`);
      }
    }
  };

  // Render Reader view if specified
  if (view === 'reader' && activeRecipe) {
    return (
      <ReaderView 
        recipe={activeRecipe} 
        fontSize={fontSize} 
        onFontSizeChange={handleFontSizeChange}
        onToggleView={toggleReaderView}
      />
    );
  }

  return (
    <div className="recipes-app">
      <div className="app-header">
        {/* View controls moved to RecipeDetail */}
      </div>

      <div className="recipes-content">
        <RecipeList 
          recipes={recipes} 
          onSelectRecipe={handleRecipeSelect}
          activeurlPermalink={activeRecipe?.permalink}
        />

        {activeRecipe ? (
          <RecipeDetail 
            recipe={activeRecipe} 
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            currentView={view}
            onToggleView={toggleReaderView}
          />
        ) : (
          <div className="empty-state">
            <p>Select a recipe to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesApp;
