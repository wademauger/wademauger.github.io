import React, { useState, useEffect } from 'react';
import { Button, Slider, InputNumber, Flex } from 'antd';
import { PrinterOutlined, CloseCircleOutlined, ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import Table from './table';
import { NavLink, useParams } from 'react-router';
import '../App.css';
import recipes from '../data/recipes/index';
import { useSelector, useDispatch } from 'react-redux';
import { setIsPrintMode, setFontSize } from '../reducers/recipes.reducer';

const RecipeIndex = () => Object.keys(recipes).map((category, index) => {
  return (
    <div key={index}>
      <h1 className="text-2xl font-semibold">{category}</h1>
      <ul>
        {recipes[category].map(recipe => <li key={recipe.permalink}><NavLink to={`/hobbies/recipes/${recipe.permalink}`}>{recipe.title}</NavLink></li>)}
      </ul>
    </div>
  );
});

function Recipes() {
  const { id } = useParams();
  const recipe = Object.keys(recipes).reduce((acc, category) => {
    const found = recipes[category].find(recipe => recipe.permalink === id);
    return found ? found : acc;
  }, null);
  const [servings, setServings] = useState(recipe ? recipe.defaultServings : 1);
  const dispatch = useDispatch();
  const isPrintMode = useSelector((state) => state.recipes.isPrintMode);
  const fontSize = useSelector((state) => state.recipes.printModeFontSize);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.defaultServings);
    }
  }, [id, recipe]);

  const handleSliderChange = (value) => {
    setServings(value);
  };

  const handlePrint = () => {
    dispatch(setIsPrintMode(!isPrintMode));
  };

  const handleIncreaseFontSize = () => {
    dispatch(setFontSize(fontSize + 7));
  };

  const handleDecreaseFontSize = () => {
    dispatch(setFontSize(fontSize - 7));
  };

  const scaledIngredients = recipe ? recipe.ingredients.map(ingredient => {
    const quantity = (ingredient.quantity * servings / recipe.defaultServings).toFixed(1);
    return {
      ...ingredient,
      quantity: quantity.endsWith('.0') ? parseInt(quantity) : quantity,
    };
  }) : [];

  const minServings = recipe ? Math.max(1, Math.floor(recipe.defaultServings / 5)) : 1;
  const maxServings = recipe ? recipe.defaultServings * 5 : 20;
  const defaultSliderValue = recipe ? Math.floor((maxServings + minServings) / 2) : 1;
  const fontSizeStyle = isPrintMode ? { fontSize: `${fontSize}px` } : {};

  return (
    <div className={`recipes-page ${isPrintMode ? 'print-mode' : ''}`} style={fontSizeStyle}>
      <main className="container mx-auto">
        {recipe ? (
          <Flex vertical justify="center" gap="small" className="recipe-flexbox">
            <h1 className='text-2xl text-left'>
              <b>{recipe.title}</b>
            </h1>
            <p className='text-left'>{recipe.description}</p>
            <div className="slider-container print-hide">
              {recipe.scalable ? (<Flex>
                <Slider
                  min={minServings}
                  max={maxServings}
                  onChange={handleSliderChange}
                  value={typeof servings === 'number' ? servings : 0}
                  defaultValue={defaultSliderValue}
                  style={{ flex: 2 }}
                />
                <span style={{ flex: 1 }}>
                  Makes
                  <InputNumber
                    min={minServings}
                    max={maxServings}
                    style={{ margin: '0 16px' }}
                    value={servings}
                    onChange={handleSliderChange}
                  />
                  {recipe.servingUnits}
                </span>
              </Flex>
              ) : (
                <p className='text-left'><i>Makes {servings} {recipe.servingUnits}</i></p>
              )}
            </div>
            <p className="text-left print-show" style={{ display: 'none' }}>
              <i>Makes {servings} {recipe.servingUnits}</i>
            </p>
            {!isPrintMode ? <Button onClick={handlePrint} className="print-button" icon={<PrinterOutlined />}>Print Recipe</Button> :
              (
                <Flex justify="center" gap="small">
                  <Button className="print-hide" onClick={handlePrint} icon={<CloseCircleOutlined />}>Back</Button>
                  <Button className="print-hide" onClick={handleDecreaseFontSize} icon={<ZoomOutOutlined />}>Font -</Button>
                  <Button className="print-hide" onClick={handleIncreaseFontSize} icon={<ZoomInOutlined />}>Font +</Button>
                </Flex>
              )}
            <Table titles={['Ingredient', '#', 'Units']} elements={scaledIngredients} />
            <h1 className='text-2xl text-left'><b>Steps:</b></h1>
            <ul className='text-left steps-list'>
              {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ul>
            {recipe.notes.length > 0 ? (
              <>
                <h1 className='text-2xl text-left'><b>Notes:</b></h1>
                <ul className='text-left steps-list'>
                  {recipe.notes.map((note, index) => <li key={index}>{note}</li>)}
                </ul>
              </>
            ) : null}
          </Flex>
        ) : <RecipeIndex />}
      </main>
    </div>
  );
}

export default Recipes;