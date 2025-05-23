import React, { useState } from 'react';

const RecipeList = ({ recipes, onSelectRecipe, fontSize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Initialize all sections as collapsed when recipes change or on first load
  React.useEffect(() => {
    const sections = Object.keys(recipes);
    const initialCollapsedState = {};
    sections.forEach(section => {
      initialCollapsedState[section] = true; // true means collapsed
    });
    setCollapsedSections(initialCollapsedState);
  }, [recipes]);

  // Toggle section collapse state
  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Helper function to check if a recipe contains the search term
  const recipeMatchesSearch = (recipe) => {
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

  // Filter regular recipes by section
  const filteredRecipes = Object.entries(recipes).reduce((acc, [sectionKey, sectionRecipes]) => {
    const filtered = sectionRecipes.filter(recipeMatchesSearch);
    if (filtered.length > 0) {
      acc[sectionKey] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="recipe-list" style={{ fontSize: `${fontSize}%` }}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Filter by ingredients, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="recipe-items">
        {Object.keys(filteredRecipes).length > 0 ? (
          <div className="recipe-sections">
            {Object.entries(filteredRecipes).map(([sectionKey, sectionRecipes]) => (
              <div key={sectionKey} className="recipe-section">
                <h6
                  onClick={() => toggleSection(sectionKey)}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ marginRight: '8px' }}>
                    {collapsedSections[sectionKey] ? '▶' : '▼'}
                  </span>
                  {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
                </h6>
                {!collapsedSections[sectionKey] && (
                  <ul>
                    {sectionRecipes.map(recipe => (
                      <li key={recipe.permalink} onClick={() => onSelectRecipe(recipe)}>
                        {recipe.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
