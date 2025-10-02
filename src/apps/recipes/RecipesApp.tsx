import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { App } from 'antd';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import NewRecipeForm from './components/NewRecipeForm';
import LibraryModal from '../../components/LibraryModal';
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
import { closeModal, openModal } from '../../reducers/modal.reducer';
import recipeLibrary from '../../data/recipes';
import LibraryFileSelector from './components/LibraryFileSelector';
import './styles/RecipesApp.css';

const RecipesApp = () => {
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [fontSize, setFontSize] = useState(100); // Font size in percentage
  const [showDemoRecipes, setShowDemoRecipes] = useState(true); // Toggle for demo recipes
  const [showLibrarySelector, setShowLibrarySelector] = useState(false); // Library file selector modal
  
  // Get Redux modal state
  const currentModal = useSelector((state) => state.modal.currentModal);
  // modalData unused for now but available in redux state.modal.modalData
  const isNewRecipeModalOpen = currentModal === 'NEW_RECIPE';
  const isLibrarySettingsModalOpen = currentModal === 'LIBRARY_SETTINGS';
  
  // Debug logging for modal state changes
  useEffect(() => {
    console.log('🔍 Redux modal state changed to:', currentModal);
  }, [currentModal]);

  // Check for Redux modal state that might be interfering
  const reduxModalState = useSelector((state) => state.modal);
  useEffect(() => {
    console.log('🔧 Redux modal state:', reduxModalState);
  }, [reduxModalState]);
  
  // Use the singleton instance instead of creating a new one
  const [driveService] = useState(() => GoogleDriveRecipeService);
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
    // error unused for now but available in redux state
    editingEnabled 
  } = useSelector(state => state.recipes);


  // Handle editing toggle
  const handleEditingToggle = (enabled) => {
    dispatch(setEditingEnabled(enabled));
  };

  // Initialize Google Drive service
  useEffect(() => {
    const initializeGoogleDrive = async () => {
      try {
        // Use the recipes-specific Google Client ID
        const CLIENT_ID = import.meta.env.VITE_GOOGLE_RECIPES_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
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
      } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Failed to load recipes from Google Drive:', error);
      
      if (error.message === 'NO_LIBRARY_FOUND') {
        // No library file found - show friendly message without auto-creation
        dispatch(setError('No recipe library found'));
        message.info('No recipe library found. Use Library Settings to create or select one.');
        dispatch(setDriveRecipes([])); // Set empty array instead of error state
      } else if (error.message === 'MULTIPLE_LIBRARIES_FOUND') {
        // Multiple libraries found - show selector
        dispatch(setError('Multiple libraries found'));
        setShowLibrarySelector(true);
        message.info('Multiple recipe libraries found. Please select which one to use.');
      } else {
        // Other errors
        dispatch(setError('Failed to load recipes from Google Drive'));
        message.error('Failed to load recipes from Google Drive');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async (tokenResponse = null) => {
    try {
      dispatch(setLoading(true));
      
      if (tokenResponse) {
        // Handle OAuth token response from @react-oauth/google
        await driveService.handleOAuthToken(tokenResponse);
      } else {
        // Fallback to original signIn method
        await driveService.signIn();
      }
      
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Sign out failed:', error);
      message.error('Failed to sign out of Google Drive');
    }
  };

  // Handle Google Drive settings changes
  const handleSettingsChange = async (settings) => {
    try {
      driveService.updateSettings(settings);
      message.success('Google Drive settings updated successfully');
      
      // Optionally reload the library with new settings
      if (isGoogleDriveConnected) {
        await loadRecipesFromDrive();
      }
    } catch (error: unknown) {
      console.error('Failed to update settings:', error);
      message.error('Failed to update Google Drive settings');
    }
  };

  // Listen for header-emitted auth events for recipes
  React.useEffect(() => {
    const onSigninSuccess = (ev) => {
      try {
        const d = ev && ev.detail;
        if (!d) return;
        if (d.app && d.app !== 'recipes') return;
        handleGoogleSignIn(d.tokenResponse || null);
      } catch (e: unknown) { /* swallow */ }
    };
    const onSigninError = (ev) => {
      try {
        const d = ev && ev.detail;
        if (!d) return;
        if (d.app && d.app !== 'recipes') return;
        // Report the error via existing handler
        handleGoogleSignInError && handleGoogleSignInError(d.error);
      } catch (e: unknown) { /* swallow */ }
    };
    const onSignout = (ev) => {
      try {
        const d = ev && ev.detail;
        if (!d) return;
        if (d.app && d.app !== 'recipes') return;
        handleGoogleSignOut();
      } catch (e: unknown) { /* swallow */ }
    };

    window.addEventListener('app:google-signin-success', onSigninSuccess);
    window.addEventListener('app:google-signin-error', onSigninError);
    window.addEventListener('app:google-signout', onSignout);
    return () => {
      window.removeEventListener('app:google-signin-success', onSigninSuccess);
      window.removeEventListener('app:google-signin-error', onSigninError);
      window.removeEventListener('app:google-signout', onSignout);
    };
  }, []);

  // Handle creating a new recipe
  const handleCreateNewRecipe = () => {
    console.log('� NEW RECIPE BUTTON CLICKED - handleCreateNewRecipe called');
    console.log('�🔍 "New Recipe" button clicked');
    console.log('🔍 Google Drive connected:', isGoogleDriveConnected);
    
    if (!isGoogleDriveConnected) {
      console.log('⚠️ Not signed in to Google Drive - showing warning');
      message.warning('Please sign in to Google Drive to create recipes');
      return;
    }
    
    // Use Redux modal system for consistency
    console.log('🔧 Opening New Recipe modal via Redux');
    dispatch(openModal({
      modalType: 'NEW_RECIPE',
      appContext: 'recipes',
      data: {}
    }));
  };

  // Handle editing a recipe
  const handleEditRecipe = () => {
    if (!activeRecipe) return;
    
    if (!isGoogleDriveConnected) {
      message.warning('Please sign in to Google Drive to edit recipes');
      return;
    }
    
    // Toggle editing mode
    dispatch(setEditingEnabled(!editingEnabled));
    message.info(editingEnabled ? 'Editing mode disabled' : 'Editing mode enabled');
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async () => {
    if (!activeRecipe) return;
    
    if (!isGoogleDriveConnected) {
      message.warning('Please sign in to Google Drive to delete recipes');
      return;
    }
    
    try {
      dispatch(setLoading(true));
      await driveService.deleteRecipe(activeRecipe.id);
      
      // Remove from local state
      const updatedRecipes = driveRecipes.filter(r => r.id !== activeRecipe.id);
      dispatch(setDriveRecipes(updatedRecipes));
      
      // Clear active recipe
      setActiveRecipe(null);
      navigate('/crafts/recipes');
      
      message.success(`Recipe "${activeRecipe.title}" deleted successfully`);
    } catch (error: unknown) {
      console.error('Failed to delete recipe:', error);
      message.error('Failed to delete recipe. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
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
      dispatch(closeModal());
      
      // Navigate to the new recipe
      const targetUrl = `/crafts/recipes/${savedRecipe.permalink}`;
      console.log('Navigating to:', targetUrl);
      navigate(targetUrl);
      
      message.success('New recipe created! Start editing to customize it.');
    } catch (error: unknown) {
      console.error('Failed to create recipe:', error);
      message.error('Failed to create new recipe. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  // Handle library file selection
  const handleLibraryFileSelect = async (file) => {
    try {
      dispatch(setLoading(true));
      const library = await driveService.selectLibraryFile(file.id);
      dispatch(setDriveRecipes(library.recipes || []));
      message.success(`Selected library "${file.name}" with ${library.recipes?.length || 0} recipes`);
      setShowLibrarySelector(false);
    } catch (error: unknown) {
      console.error('Failed to select library file:', error);
      message.error('Failed to select library file');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Create filtered recipes based on demo recipe toggle
  const filteredRecipes = useMemo(() => {
    if (showDemoRecipes) {
      return recipeLibrary;
    } else {
      // Return same structure but with empty arrays when demo recipes are hidden
      const emptyLibrary = {};
      Object.keys(recipeLibrary).forEach(section => {
        emptyLibrary[section] = [];
      });
      return emptyLibrary;
    }
  }, [showDemoRecipes, recipeLibrary]);

  useEffect(() => {
    console.log('🔍 useEffect triggered with urlPermalink:', urlPermalink);
    console.log('🔍 driveRecipes state:', driveRecipes.length, driveRecipes.map(r => r.permalink));
    setRecipes(filteredRecipes);
    
    // Find recipe across all sections when URL permalink changes
    if (urlPermalink) {
      // Helper function to find a recipe by permalink across all sections and driveRecipes
      const findRecipeByPermalink = (permalink) => {
        console.log('🔍 Looking for permalink:', permalink);
        
        // First check driveRecipes
        console.log('🔍 Checking driveRecipes:', driveRecipes.map(r => ({ title: r.title, permalink: r.permalink })));
        const driveRecipe = driveRecipes.find(recipe => recipe.permalink === permalink);
        if (driveRecipe) {
          console.log('✅ Found recipe in driveRecipes:', driveRecipe.title);
          return driveRecipe;
        }
        
        // Then check filtered local recipe library for display (respects demo recipe toggle)
        console.log('🔍 Checking filtered recipe library sections:', Object.keys(filteredRecipes));
        for (const section in filteredRecipes) {
          console.log(`🔍 Checking section "${section}":`, filteredRecipes[section].map(r => ({ title: r.title, permalink: r.permalink })));
          const foundRecipe = filteredRecipes[section].find(r => r.permalink === permalink);
          if (foundRecipe) {
            console.log('✅ Found recipe in filtered recipe library:', foundRecipe.title);
            return foundRecipe;
          }
        }
        
        // If not found in filtered recipes, check the full recipeLibrary to handle direct URLs
        // This allows demo recipes to be accessed via URL even when toggle is off
        console.log('🔍 Recipe not found in filtered library, checking full library for URL support');
        for (const section in recipeLibrary) {
          const foundRecipe = recipeLibrary[section].find(r => r.permalink === permalink);
          if (foundRecipe) {
            console.log('✅ Found recipe in full recipe library (URL access):', foundRecipe.title);
            return foundRecipe;
          }
        }
        
        console.log('❌ Recipe not found anywhere');
        return null;
      };
      
      const recipe = findRecipeByPermalink(urlPermalink);
      console.log('🎯 Final found recipe:', recipe?.title || 'null');
      if (recipe) {
        setActiveRecipe(recipe);
        console.log('✅ Set activeRecipe to:', recipe.title);
      } else {
        // Recipe not found, clear active recipe
        console.log('❌ Recipe not found, clearing activeRecipe');
        setActiveRecipe(null);
      }
    } else if (!urlPermalink) {
      // No recipe in URL, clear active recipe
      console.log('🔄 No urlPermalink, clearing active recipe');
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

  // Determine which recipe to display - priority: activeRecipe > draftRecipe > none
  const displayRecipe = activeRecipe || draftRecipe;
  
  console.log('Render state:', {
    activeRecipe: activeRecipe?.title || 'null',
    draftRecipe: draftRecipe?.title || 'null',
    displayRecipe: displayRecipe?.title || 'null',
    urlPermalink
  });

  return (
    <div className="recipes-app">
      {/* Main Content - Vertical Stack Layout */}
      <div className="recipes-content-vertical" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        margin: '0 auto',
        width: 'auto',
        maxWidth: '1200px'
      }}>
        {/* Selected Recipe Content - Show First When Recipe is Selected */}
        {activeRecipe && (
          <div className="selected-recipe-section" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            width: '100%',
            minHeight: 'fit-content'
          }}>
            <RecipeDetail 
              recipe={activeRecipe} 
              fontSize={fontSize}
              onFontSizeChange={handleFontSizeChange}
              editingEnabled={editingEnabled}
              onEditRecipe={handleEditRecipe}
              onDeleteRecipe={handleDeleteRecipe}
            />
          </div>
        )}

        {/* Recipe Library Section */}
        <div className="recipe-library-section" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '1rem',
          minHeight: activeRecipe ? '300px' : '500px'
        }}>
          <RecipeList 
            recipes={recipes} 
            onSelectRecipe={handleRecipeSelect}
            activeurlPermalink={activeRecipe?.permalink}
            isGoogleDriveConnected={isGoogleDriveConnected}
            userInfo={userInfo}
            onSignIn={handleGoogleSignIn}
            onSignOut={handleGoogleSignOut}
            onSettingsChange={handleSettingsChange}
            onCreateNewRecipe={handleCreateNewRecipe}
            editingEnabled={editingEnabled}
            onEditingToggle={handleEditingToggle}
            showDemoRecipes={showDemoRecipes}
            onDemoRecipesToggle={setShowDemoRecipes}
            isLoading={isLoading}
            message={message}
          />
          
          {!activeRecipe && (
            <div className="empty-state" style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <p>Select a recipe to view details</p>
              {!isGoogleDriveConnected && (
                <p>Sign in to Google Drive to create and edit recipes</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Recipe Modal */}
      {console.log('🎨 RENDER: About to render NewRecipeForm with visible:', isNewRecipeModalOpen)}
      <NewRecipeForm
        visible={isNewRecipeModalOpen}
        onCancel={() => {
          console.log('🔧 NewRecipeForm onCancel called - closing Redux modal');
          dispatch(closeModal());
        }}
        onSave={handleSaveNewRecipe}
        loading={isLoading}
      />

      {/* Library File Selector Modal */}
      <LibraryFileSelector
        isVisible={showLibrarySelector}
        onClose={() => setShowLibrarySelector(false)}
        onSelectFile={handleLibraryFileSelect}
        driveService={driveService}
        isLoading={isLoading}
      />

      {/* Library Settings Modal */}
  {console.log('🎨 RENDER: About to render LibraryModal with visible:', isLibrarySettingsModalOpen)}
  <LibraryModal />
    </div>
  );
};

export default RecipesApp;
