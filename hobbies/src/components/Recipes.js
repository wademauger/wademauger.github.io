import React, { useState, useEffect } from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';
import Table from './table';
import { NavLink, useParams } from 'react-router';
import '../App.css';
import recipes from '../data/recipes';

const RecipeIndex = () => {
  return <><h1 className="text-2xl font-semibold">All Recipes:</h1>
    <ul>
      {recipes.map(recipe => <li key={recipe.permalink}><NavLink to={`/recipes/${recipe.permalink}`}>{recipe.title}</NavLink></li>)}
    </ul>
  </>;
};

function Recipes() {
  const { id } = useParams();
  const recipe = recipes.find(recipe => recipe.permalink == id);
  const [servings, setServings] = useState(recipe ? recipe.defaultServings : 1);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.defaultServings);
    }
  }, [id, recipe]);

  const handleSliderChange = (value) => {
    setServings(value);
  };

  const scaledIngredients = recipe ? recipe.ingredients.map(ingredient => ({
    ...ingredient,
    quantity: (ingredient.quantity * servings / recipe.defaultServings).toFixed(1),
  })) : [];

  const minServings = recipe ? Math.max(1, Math.floor(recipe.defaultServings / 5)) : 1;
  const maxServings = recipe ? recipe.defaultServings * 5 : 20;
  const defaultSliderValue = recipe ? Math.floor((maxServings + minServings) / 2) : 1;

  return (
    <div className="recipes-page">
      <main className="container mx-auto mt-8 px-4">
        {recipe ? <>
          <h1 className='text-2xl text-left'><b>{recipe.title}</b></h1>
          <p className='text-left'>{recipe.description}</p>
          <div className="slider-container">
            {recipe.scalable ?
              <Row>
                <Col span={10}>
                  <Slider
                    min={minServings}
                    max={maxServings}
                    onChange={handleSliderChange}
                    value={typeof servings === 'number' ? servings : 0}
                    defaultValue={defaultSliderValue}
                  />
                </Col>
                <Col span={6}>
                  Makes
                  <InputNumber
                    min={minServings}
                    max={maxServings}
                    style={{ margin: '0 16px' }}
                    value={servings}
                    onChange={handleSliderChange}
                  />
                  {recipe.servingUnits}
                </Col>
              </Row>
              :
              <p className='text-left'><i>Makes {servings} {recipe.servingUnits}</i></p>
            }
          </div>
          <Table titles={['Ingredient', 'Amt', 'Units']} elements={scaledIngredients} />
          <h1 className='text-2xl text-left'><b>Steps:</b></h1>
          <ul className='text-left steps-list'>
            {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ul>
          {recipe.notes.length > 0 ?
            <>
              <h1 className='text-2xl text-left'><b>Notes:</b></h1>
              <ul className='text-left steps-list'>
                {recipe.notes.map((note, index) => <li key={index}>{note}</li>)}
              </ul>
            </>
            : null}
        </> : <RecipeIndex/>}
      </main>
    </div>
  );
}

export default Recipes;