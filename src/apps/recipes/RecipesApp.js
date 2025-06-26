import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { App, Button, Switch, Space, Spin } from 'antd';
import { PlusOutlined, FolderAddOutlined } from '@ant-design/icons';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import ReaderView from './components/ReaderView';
import GoogleSignInButton from './components/GoogleSignInButton';
import NewRecipeForm from './components/NewRecipeForm';
import GoogleDriveRecipeService from './services/GoogleDriveRecipeService';
import {
  setEditingEnabled,
  setGoogleDriveConnection,
  setUserInfo,
  setDriveRecipes,
  setLoading,
  setError,
  addDriveRecipe
} from '../../reducers/recipes.reducer';
import recipeLibrary from '../../data/recipes';
import './styles/RecipesApp.css';

const RecipesApp = ({ view = 'standard' }) => {
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [fontSize, setFontSize] = useState(100); // Font size in percentage
  const [showNewRecipeModal, setShowNewRecipeModal] = useState(false);
  
  // Debug logging for modal state changes
  useEffect(() => {
    console.log('🔍 RecipesApp - showNewRecipeModal changed to:', showNewRecipeModal);
  }, [showNewRecipeModal]);
  
  const [driveService] = useState(() => new GoogleDriveRecipeService());
  const recipeDetailRef = useRef(null); // Ref for scrolling to recipe detail
  
  const urlPermalink = useParams().recipeId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { message } = App.useApp();
  
  // Get state from Redux
  const { 
    draftRecipe, 
    isGoogleDriveConnected, 
    userInfo, 
    driveRecipes, 
    isLoading, 
    error,
    editingEnabled 
  } = useSelector(state => state.recipes);

  // Helper function to count total recipes
  const getTotalRecipesCount = () => {
    const localCount = Object.values(recipes).reduce((total, sectionRecipes) => 
      total + (Array.isArray(sectionRecipes) ? sectionRecipes.length : 0), 0
    );
    const driveCount = driveRecipes.length;
    return localCount + driveCount;
  };

  // Handle editing toggle
  const handleEditingToggle = (enabled) => {
    dispatch(setEditingEnabled(enabled));
  };

  // Initialize Google Drive service
  useEffect(() => {
    const initializeGoogleDrive = async () => {
      try {
        // Use the recipes-specific Google Client ID
        const CLIENT_ID = process.env.REACT_APP_GOOGLE_RECIPES_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!CLIENT_ID || CLIENT_ID === 'your-recipes-oauth-client-id-here') {
          console.warn('Google Recipes Client ID not configured. Please set REACT_APP_GOOGLE_RECIPES_CLIENT_ID in .env file');
          return;
        }
        
        await driveService.initialize(CLIENT_ID);
        
        // Check if user is already signed in
        const status = driveService.getSignInStatus();
        if (status.isSignedIn) {
          dispatch(setGoogleDriveConnection(true));
          dispatch(setUserInfo({
            userName: status.userName,
            userEmail: status.userEmail,
            userPicture: status.userPicture
          }));
          
          // Load recipes from Google Drive
          await loadRecipesFromDrive();
        }
      } catch (error) {
        console.error('Failed to initialize Google Drive service:', error);
      }
    };

    initializeGoogleDrive();
  }, []);

  const loadRecipesFromDrive = async () => {
    try {
      dispatch(setLoading(true));
      const library = await driveService.loadRecipeLibrary();
      dispatch(setDriveRecipes(library.recipes || []));
      message.success(`Recipes loaded from Google Drive - Found ${library.recipes?.length || 0} recipes`);
    } catch (error) {
      console.error('Failed to load recipes from Google Drive:', error);
      dispatch(setError('Failed to load recipes from Google Drive'));
      message.error('Failed to load recipes from Google Drive');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      dispatch(setLoading(true));
      await driveService.signIn();
      
      const status = driveService.getSignInStatus();
      dispatch(setGoogleDriveConnection(true));
      dispatch(setUserInfo({
        userName: status.userName,
        userEmail: status.userEmail,
        userPicture: status.userPicture
      }));
      
      // Load recipes from Google Drive
      await loadRecipesFromDrive();
      
      message.success('Successfully signed in to Google Drive');
    } catch (error) {
      console.error('Google sign in failed:', error);
      dispatch(setError('Failed to sign in to Google Drive'));
      message.error('Failed to sign in to Google Drive. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await driveService.signOut();
      dispatch(setGoogleDriveConnection(false));
      dispatch(setUserInfo(null));
      dispatch(setDriveRecipes([]));
      
      message.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      message.error('Failed to sign out of Google Drive');
    }
  };

  // Handle creating a new recipe
  const handleCreateNewRecipe = () => {
    console.log('🔍 "New Recipe" button clicked');
    console.log('🔍 Google Drive connected:', isGoogleDriveConnected);
    
    if (!isGoogleDriveConnected) {
      console.log('⚠️ Not signed in to Google Drive - showing warning');
      message.warning('Please sign in to Google Drive to create recipes');
      return;
    }
    
    console.log('🔧 Opening New Recipe modal - setting showNewRecipeModal to true');
    setShowNewRecipeModal(true);
  };

  // Handle saving a new recipe from the modal
  const handleSaveNewRecipe = async (recipeData) => {
    try {
      dispatch(setLoading(true));
      const savedRecipe = await driveService.addRecipe(recipeData);
      
      console.log('Created recipe:', savedRecipe);
      console.log('Recipe permalink:', savedRecipe.permalink);
      
      // Add to Redux store
      dispatch(addDriveRecipe(savedRecipe));
      
      // Set as active recipe immediately
      setActiveRecipe(savedRecipe);
      
      // Close modal
      setShowNewRecipeModal(false);
      
      // Navigate to the new recipe
      const targetUrl = `/crafts/recipes/${savedRecipe.permalink}`;
      console.log('Navigating to:', targetUrl);
      navigate(targetUrl);
      
      message.success('New recipe created! Start editing to customize it.');
    } catch (error) {
      console.error('Failed to create recipe:', error);
      message.error('Failed to create new recipe. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  // Handle creating a new recipe group
  const handleCreateNewGroup = async () => {
    if (!isGoogleDriveConnected) {
      message.warning('Please sign in to Google Drive to create recipe groups');
      return;
    }

    try {
      // For now, we'll create a simple group structure
      // This could be extended to create actual folder structures in Google Drive
      message.info('Recipe group creation coming soon! For now, you can organize recipes by editing their categories.');
    } catch (error) {
      console.error('Failed to create recipe group:', error);
      message.error('Failed to create new recipe group. Please try again.');
    }
  };
  
  useEffect(() => {
    console.log('useEffect triggered with urlPermalink:', urlPermalink);
    setRecipes(recipeLibrary);
    
    // Find recipe across all sections when URL permalink changes
    if (urlPermalink) {
      // Helper function to find a recipe by permalink across all sections and driveRecipes
      const findRecipeByPermalink = (permalink) => {
        console.log('Looking for permalink:', permalink);
        
        // First check driveRecipes
        console.log('Checking driveRecipes:', driveRecipes.map(r => ({ title: r.title, permalink: r.permalink })));
        const driveRecipe = driveRecipes.find(recipe => recipe.permalink === permalink);
        if (driveRecipe) {
          console.log('Found recipe in driveRecipes:', driveRecipe.title);
          return driveRecipe;
        }
        
        // Then check local recipe library
        console.log('Checking local recipeLibrary...');
        for (const section in recipeLibrary) {
          const foundRecipe = recipeLibrary[section].find(r => r.permalink === permalink);
          if (foundRecipe) {
            console.log('Found recipe in recipeLibrary:', foundRecipe.title);
            return foundRecipe;
          }
        }
        
        console.log('Recipe not found anywhere');
        return null;
      };
      
      const recipe = findRecipeByPermalink(urlPermalink);
      console.log('Found recipe:', recipe?.title || 'null');
      if (recipe) {
        setActiveRecipe(recipe);
      } else {
        // Recipe not found, clear active recipe
        console.log('Recipe not found, clearing activeRecipe');
        setActiveRecipe(null);
      }
    } else if (!urlPermalink) {
      // No recipe in URL, clear active recipe
      console.log('No urlPermalink, clearing active recipe');
      setActiveRecipe(null);
    }
  }, [urlPermalink, driveRecipes]); // Added driveRecipes as dependency

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
  };

  const handleRecipeSelect = (recipe) => {
    console.log('Recipe selected:', recipe.title, recipe.permalink);
    navigate(`/crafts/recipes/${recipe.permalink}`);
    
    // Scroll to recipe detail after a short delay to allow navigation to complete
    setTimeout(() => {
      if (recipeDetailRef.current) {
        recipeDetailRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const toggleReaderView = () => {
    if (activeRecipe) {
      if (view === 'reader') {
        navigate(`/crafts/recipes/${activeRecipe.permalink}`);
      } else {
        navigate(`/crafts/recipes/reader-view/${activeRecipe.permalink}`);
      }
    }
  };

  // Determine which recipe to display - priority: activeRecipe > draftRecipe > none
  const displayRecipe = activeRecipe || draftRecipe;
  
  console.log('Render state:', {
    activeRecipe: activeRecipe?.title || 'null',
    draftRecipe: draftRecipe?.title || 'null',
    displayRecipe: displayRecipe?.title || 'null',
    urlPermalink
  });

  // Render Reader view if specified
  if (view === 'reader' && displayRecipe) {
    return (
      <ReaderView 
        recipe={displayRecipe} 
        fontSize={fontSize} 
        onFontSizeChange={handleFontSizeChange}
        onToggleView={toggleReaderView}
      />
    );
  }

  return (
    <div className="recipes-app">
      <div className="app-header">
        <div className="header-controls">
          <Space size="large" wrap>
            {/* Recipe Creation Controls */}
            {isGoogleDriveConnected && (
              <Button 
                type="primary"
                style={{
                  background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                  borderColor: 'transparent',
                }}
                icon={<PlusOutlined />}
                onClick={handleCreateNewRecipe}
                loading={isLoading}
              >
                🤖 New Recipe
              </Button>
            )}

            {/* Editing Toggle */}
            <div className="edit-controls">
              <Space>
                <span className="edit-label">Edit Mode:</span>
                <Switch
                  checked={editingEnabled}
                  onChange={handleEditingToggle}
                  disabled={!isGoogleDriveConnected}
                />
              </Space>
            </div>

            {/* Library Status */}
            <div className="library-status-header">
              <Space direction="vertical" size="small" align="center">
                <span className="library-count-header">
                  {getTotalRecipesCount()} recipes total
                </span>
                
                {isLoading ? (
                  <div className="loading-indicator-header">
                    <Spin size="small" />
                    <span className="loading-text-header">Loading...</span>
                  </div>
                ) : (isGoogleDriveConnected ? (
                  <span className="sync-indicator connected">
                    ✓ Google Drive Connected
                  </span>
                ) : (
                  <span className="sync-indicator disconnected">
                    ✗ Not Connected to Google Drive
                  </span>
                ))}
              </Space>
            </div>

            {/* Google Drive Integration */}
            <div className="google-drive-section">
              <GoogleSignInButton
                onSuccess={handleGoogleSignIn}
                onError={(error) => message.error('Sign in failed')}
                onSignOut={handleGoogleSignOut}
                isSignedIn={isGoogleDriveConnected}
                loading={isLoading}
                userInfo={userInfo}
              />
            </div>
          </Space>
        </div>
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
            editingEnabled={editingEnabled}
          />
        ) : (
          <div className="empty-state">
            <p>Select a recipe to view details</p>
            {!isGoogleDriveConnected && (
              <p>Sign in to Google Drive to create and edit recipes</p>
            )}
          </div>
        )}
      </div>

      {/* New Recipe Modal */}
      <NewRecipeForm
        visible={showNewRecipeModal}
        onCancel={() => setShowNewRecipeModal(false)}
        onSave={handleSaveNewRecipe}
        loading={isLoading}
      />
    </div>
  );
};

export default RecipesApp;
