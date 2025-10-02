import React from 'react';
import { useSelector } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import RecipeListTree from './RecipeListTree';
import AppNavigation from '../../../components/AppNavigation';
import './RecipeList.css';

const RecipeList = ({ 
  recipes, 
  onSelectRecipe, 
  activeurlPermalink,
  isGoogleDriveConnected,
  userInfo,
  onSignIn,
  onSignOut,
  onSettingsChange, // New prop for settings changes
  onCreateNewRecipe,
  editingEnabled,
  onEditingToggle,
  showDemoRecipes,
  onDemoRecipesToggle,
  isLoading,
  message
}) => {
  const { driveRecipes } = useSelector(state => state.recipes);

  // Local function to count total recipes
  const getTotalRecipesCount = () => {
    const localCount = Object.values(recipes).reduce((total, sectionRecipes) => 
      total + (Array.isArray(sectionRecipes) ? sectionRecipes.length : 0), 0
    );
    const driveCount = driveRecipes.length;
    return localCount + driveCount;
  };

  return (
    <div className="recipe-list">
      {/* Recipe Library Navigation */}
      <AppNavigation
        appName="Recipes"
        isGoogleDriveConnected={isGoogleDriveConnected}
        userInfo={userInfo}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onSettingsChange={onSettingsChange}
        primaryAction={isGoogleDriveConnected ? {
          label: '🤖 New Recipe',
          icon: <PlusOutlined />,
          onClick: () => {
            console.log('🎯 PRIMARY ACTION CLICKED - calling onCreateNewRecipe');
            onCreateNewRecipe();
          },
          loading: isLoading
        } : null}
        toggles={[
          {
            label: 'Edit Mode',
            checked: editingEnabled,
            onChange: onEditingToggle,
            disabled: !isGoogleDriveConnected
          }
        ]}
        status={{
          count: getTotalRecipesCount(),
          loading: isLoading,
          loadingText: 'Loading...'
        }}
        libraryInfo={{
          title: 'Recipes',
          emoji: '',
          count: getTotalRecipesCount(),
          isLoading: isLoading
        }}
        googleSignInProps={{
          onError: () => message.error('Sign in failed'),
          loading: isLoading,
          showDemoRecipes: showDemoRecipes,
          onDemoRecipesToggle: onDemoRecipesToggle
        }}
        style={{
          background: 'transparent',
          padding: 0,
          margin: 0
        }}
        className="recipes-navigation"
      />

      {/* Recipe Tree */}
      <RecipeListTree
        recipes={recipes}
        driveRecipes={driveRecipes}
        onSelectRecipe={onSelectRecipe}
        activeRecipePermalink={activeurlPermalink}
      />
    </div>
  );
};

export default RecipeList;
