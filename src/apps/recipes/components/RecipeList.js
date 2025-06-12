import React, { useState, useMemo } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, TextField } from '@mui/material';

const RecipeList = ({ recipes, onSelectRecipe, fontSize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);

  // Helper function to check if a recipe contains the search term - memoized
  const recipeMatchesSearch = useMemo(() => {
    return (recipe) => {
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      // Check if any property in the recipe contains the search term
      return Object.values(recipe).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        } else if (Array.isArray(value)) {
          return value.some(item =>
            typeof item === 'string' && item.toLowerCase().includes(term)
          );
        }
        return false;
      });
    };
  }, [searchTerm]);

  // Filter regular recipes by section - memoized to prevent infinite loops
  const filteredRecipes = useMemo(() => {
    return Object.entries(recipes).reduce((acc, [sectionKey, sectionRecipes]) => {
      const filtered = sectionRecipes.filter(recipeMatchesSearch);
      if (filtered.length > 0) {
        acc[sectionKey] = filtered;
      }
      return acc;
    }, {});
  }, [recipes, searchTerm]); // Only depend on recipes and searchTerm, not the function itself

  // Auto-expand all sections when user is searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      // When searching, expand all sections that have results
      const sectionsWithResults = Object.keys(filteredRecipes);
      setExpandedItems(sectionsWithResults);
    } else {
      // When not searching, collapse all sections
      setExpandedItems([]);
    }
  }, [searchTerm, filteredRecipes]);

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    // Find the recipe by itemId (permalink) in original recipes (not filtered)
    for (const [sectionKey, sectionRecipes] of Object.entries(recipes)) {
      const recipe = sectionRecipes.find(recipe => recipe.permalink === itemId);
      if (recipe) {
        onSelectRecipe(recipe);
        break;
      }
    }
  };

  const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };

  return (
    <div className="recipe-list" style={{ fontSize: `${fontSize}%` }}>
      <div className="search-bar">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Filter by ingredients, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
      </div>

      <div className="recipe-items">
        {Object.keys(filteredRecipes).length > 0 ? (
          <Box sx={{ minHeight: 352, minWidth: 300 }}>
            <SimpleTreeView
              expandedItems={expandedItems}
              onExpandedItemsChange={handleExpandedItemsChange}
              onItemSelectionToggle={handleItemSelectionToggle}
              sx={{
                '& .MuiTreeItem-content': {
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
                '& .MuiTreeItem-label': {
                  fontSize: 'inherit',
                },
              }}
            >
              {Object.entries(filteredRecipes).map(([sectionKey, sectionRecipes]) => (
                <TreeItem 
                  key={sectionKey} 
                  itemId={sectionKey} 
                  label={sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
                >
                  {sectionRecipes.map(recipe => (
                    <TreeItem 
                      key={recipe.permalink} 
                      itemId={recipe.permalink} 
                      label={recipe.title}
                    />
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          </Box>
        ) : (
          <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
