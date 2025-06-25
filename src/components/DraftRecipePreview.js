import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Divider, Space, message } from 'antd';
import { SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { clearDraftRecipe } from '../reducers/recipes.reducer';
import { useNavigate } from 'react-router-dom';
import './DraftRecipePreview.css';

const DraftRecipePreview = ({ showEmpty = false }) => {
  const draftRecipe = useSelector(state => state.recipes.draftRecipe);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Show empty template if requested and no draft recipe exists
  if (!draftRecipe && showEmpty) {
    return (
      <div className="draft-recipe-preview">
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🤖 AI Recipe Assistant</span>
            </div>
          }
          className="recipe-preview-card empty-recipe"
        >
          <div className="recipe-preview-content">
            <div className="empty-recipe-placeholder">
              <h3 style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Recipe Title</h3>
              <p style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Recipe description will appear here...</p>
              
              <div className="recipe-meta" style={{ color: '#8c8c8c' }}>
                <span>Makes ? servings</span>
              </div>

              <Divider />

              <div className="ingredients-section">
                <h4 style={{ color: '#8c8c8c' }}>Ingredients:</h4>
                <p style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
                  Chat with the AI to generate a recipe...
                </p>
              </div>

              <Divider />

              <div className="steps-section">
                <h4 style={{ color: '#8c8c8c' }}>Steps:</h4>
                <p style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
                  Cooking instructions will appear here...
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!draftRecipe) {
    return null;
  }

  const handleSave = () => {
    // In a real app, you'd save this to your recipes collection
    message.success('Recipe saved! (This is a demo - implement saving logic)');
    
    // For demo purposes, navigate to the recipe (you'd replace with actual permalink)
    // navigate(`/crafts/recipes/${draftRecipe.permalink}`);
  };

  const handleEdit = () => {
    // In a real app, you might open a full recipe editor
    message.info('Full recipe editor would open here (to be implemented)');
  };

  const handleDiscard = () => {
    dispatch(clearDraftRecipe());
    message.info('Draft recipe discarded');
  };

  return (
    <div className="draft-recipe-preview">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🤖 AI Generated Recipe</span>
            <Space>
              <Button 
                type="primary" 
                size="small" 
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button 
                size="small" 
                danger
                icon={<DeleteOutlined />}
                onClick={handleDiscard}
              >
                Discard
              </Button>
            </Space>
          </div>
        }
        className="recipe-preview-card"
      >
        <div className="recipe-preview-content">
          <h3>{draftRecipe.title}</h3>
          <p className="recipe-description">{draftRecipe.description}</p>
          
          <div className="recipe-meta">
            <span>Makes {draftRecipe.defaultServings} {draftRecipe.servingUnits}</span>
          </div>

          <Divider />

          <div className="ingredients-section">
            <h4>Ingredients:</h4>
            <ul className="ingredients-list">
              {draftRecipe.ingredients?.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.quantity} {ingredient.units} {ingredient.ingredient}
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          <div className="steps-section">
            <h4>Steps:</h4>
            <ol className="steps-list">
              {draftRecipe.steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {draftRecipe.notes && draftRecipe.notes.length > 0 && (
            <>
              <Divider />
              <div className="notes-section">
                <h4>Notes:</h4>
                <ul className="notes-list">
                  {draftRecipe.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DraftRecipePreview;
