import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import './RecipeTree.css';

// Custom tree implementation similar to SongListTest for recipes
function RecipeListTree({ 
  recipes, 
  onSelectRecipe, 
  activeRecipePermalink,
  driveRecipes = []
}) {
  const [filterText, setFilterText] = React.useState('');
  const [expandedSections, setExpandedSections] = React.useState(new Set());
  const [selectedRecipeId, setSelectedRecipeId] = React.useState(null);

  // Combine local recipes and drive recipes into a unified structure
  const combinedRecipes = React.useMemo(() => {
    const sections = [];

    // Add local recipe sections
    Object.entries(recipes).forEach(([sectionKey, sectionRecipes]) => {
      if (Array.isArray(sectionRecipes) && sectionRecipes.length > 0) {
        sections.push({
          name: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          type: 'local',
          recipes: sectionRecipes
        });
      }
    });

    // Add Google Drive recipes section if any exist
    if (driveRecipes && driveRecipes.length > 0) {
      sections.push({
        name: 'Google Drive Recipes',
        type: 'drive',
        recipes: driveRecipes
      });
    }

    return sections;
  }, [recipes, driveRecipes]);

  // Filter recipes based on search text
  const filteredSections = React.useMemo(() => {
    if (!filterText.trim()) return combinedRecipes;
    
    const searchTerm = filterText.toLowerCase();
    return combinedRecipes
      .map(section => {
        const matchesSection = section.name.toLowerCase().includes(searchTerm);
        const filteredRecipes = section.recipes.filter(recipe => 
          recipe.title?.toLowerCase().includes(searchTerm) ||
          recipe.description?.toLowerCase().includes(searchTerm) ||
          recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm))
        );
        
        if (matchesSection || filteredRecipes.length > 0) {
          return { ...section, recipes: matchesSection ? section.recipes : filteredRecipes };
        }
        return null;
      })
      .filter(Boolean);
  }, [combinedRecipes, filterText]);

  // Toggle section expansion
  const toggleSection = React.useCallback((sectionName) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  }, []);

  // Handle recipe selection
  const handleRecipeSelect = React.useCallback((recipe) => {
    const recipeId = recipe.permalink || recipe.id || recipe.title;
    setSelectedRecipeId(recipeId);
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
  }, [onSelectRecipe]);

  // Get total recipe count
  const getTotalRecipeCount = () => {
    return combinedRecipes.reduce((total, section) => total + section.recipes.length, 0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        placeholder="Filter by recipe name, description, or ingredients..."
        sx={{ mb: 2 }}
      />
      
      <div className="recipe-tree" style={{ 
        border: '1px solid #ddd', 
        borderRadius: 8, 
        padding: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: 'white'
      }}>
        {filteredSections.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            {filterText ? 'No recipes found matching your search.' : 'No recipes available.'}
          </div>
        ) : (
          filteredSections.map(section => {
            const sectionExpanded = expandedSections.has(section.name);
            return (
              <div key={section.name} className="tree-section">
                <div 
                  className="tree-node tree-section-node"
                  onClick={() => toggleSection(section.name)}
                  style={{ cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}
                >
                  <span className="tree-toggle">
                    {section.recipes?.length > 0 ? (sectionExpanded ? '▼' : '▶') : '•'}
                  </span>
                  <span style={{ marginLeft: '8px' }}>
                    {getCategoryEmoji(section.name)} {section.name}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                    ({section.recipes?.length || 0} recipes)
                  </span>
                </div>
                
                {sectionExpanded && (
                  <div className="tree-recipes" style={{ marginLeft: '20px' }}>
                    {(section.recipes || []).map(recipe => {
                      const recipeId = recipe.permalink || recipe.id || recipe.title;
                      const isSelected = selectedRecipeId === recipeId || activeRecipePermalink === recipe.permalink;
                      return (
                        <div 
                          key={recipeId}
                          className={`tree-node tree-recipe-node ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleRecipeSelect(recipe)}
                          style={{ 
                            cursor: 'pointer', 
                            padding: '4px 8px',
                            backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                            borderRadius: '4px',
                            margin: '2px 0'
                          }}
                        >
                          <span style={{ marginLeft: '16px' }}>
                            🍽️ {recipe.title}
                            {recipe.description && (
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#666', 
                                marginLeft: '20px',
                                fontWeight: 'normal'
                              }}>
                                {recipe.description.substring(0, 60)}
                                {recipe.description.length > 60 ? '...' : ''}
                              </div>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Summary info */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center' 
      }}>
        {getTotalRecipeCount()} total recipes in {combinedRecipes.length} sections
      </div>
    </Box>
  );
}

export default RecipeListTree;