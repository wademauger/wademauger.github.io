import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import './RecipeList.css';

const RecipeList = ({ recipes, onSelectRecipe, activeurlPermalink }) => {
  const { driveRecipes } = useSelector(state => state.recipes);

  // Transform recipe data to react-folder-tree format
  const treeData = useMemo(() => {
    const topLevelSections = [];

    // Create Recipe Library section if there are local recipes
    const hasLocalRecipes = Object.entries(recipes).some(([, sectionRecipes]) => 
      Array.isArray(sectionRecipes) && sectionRecipes.length > 0
    );

    if (hasLocalRecipes) {
      const recipeLibrary = {
        name: 'Recipe Library',
        isOpen: true,
        type: 'top-section',
        children: []
      };

      // Add local recipe sections
      Object.entries(recipes).forEach(([sectionKey, sectionRecipes]) => {
        if (Array.isArray(sectionRecipes) && sectionRecipes.length > 0) {
          const sectionNode = {
            name: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
            isOpen: true,
            type: 'section',
            children: []
          };

          sectionRecipes.forEach(recipe => {
            const isSelected = activeurlPermalink === recipe.permalink;
            
            sectionNode.children.push({
              name: recipe.title,
              type: 'recipe',
              recipeData: recipe,
              isSelected: isSelected
            });
          });

          recipeLibrary.children.push(sectionNode);
        }
      });

      topLevelSections.push(recipeLibrary);
    }

    // Create Google Drive Library section if there are Google Drive recipes
    if (driveRecipes && driveRecipes.length > 0) {
      const googleDriveLibrary = {
        name: 'Google Drive Library',
        isOpen: true,
        type: 'top-section',
        children: []
      };

      driveRecipes.forEach(recipe => {
        const isSelected = activeurlPermalink === recipe.permalink;
        
        googleDriveLibrary.children.push({
          name: recipe.title,
          type: 'recipe',
          recipeData: recipe,
          isSelected: isSelected
        });
      });

      topLevelSections.push(googleDriveLibrary);
    }

    // Return a root wrapper if we have multiple sections
    if (topLevelSections.length > 1) {
      return {
        name: 'Recipes',
        isOpen: true,
        type: 'root',
        children: topLevelSections
      };
    } else if (topLevelSections.length === 1) {
      // If only one section, return it directly
      return topLevelSections[0];
    } else {
      // No recipes at all
      return {
        name: 'Recipes',
        isOpen: true,
        type: 'root',
        children: []
      };
    }
  }, [recipes, driveRecipes, activeurlPermalink]);

  const handleTreeStateChange = (newTreeState, event) => {
    console.log('Recipe tree state changed:', { newTreeState, event });
  };

  const handleNameClick = ({ defaultOnClick, nodeData }) => {
    console.log('Recipe name clicked:', { nodeData });
    
    // Handle recipe selection - only select if this is actually a recipe node
    if (nodeData && nodeData.type === 'recipe' && onSelectRecipe) {
      console.log('Selecting recipe:', nodeData.recipeData.title);
      onSelectRecipe(nodeData.recipeData);
    } else {
      // For non-recipe nodes, use default behavior (expand/collapse)
      defaultOnClick();
    }
  };

  return (
    <div className="recipe-list">
      <FolderTree
        data={treeData}
        onTreeStateChange={handleTreeStateChange}
        onNameClick={handleNameClick}
        showCheckbox={false}
        indentPixels={20}
      />
    </div>
  );
};

export default RecipeList;
