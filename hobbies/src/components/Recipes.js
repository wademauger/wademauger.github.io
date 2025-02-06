import Header from './header';
import Footer from './footer';
import Table from './table';
import { NavLink, useParams } from 'react-router';
import '../App.css';
import recipes from '../data/recipes';

function Recipes() {
  const {id} = useParams();
  const recipe = recipes.find(recipe => recipe.permalink == id); 
  return (
    <div className="recipes-page">
      <Header />
      <main class="container mx-auto mt-8 px-4">
        {recipe ? <>
          <h1 className='text-2xl text-left'><b>{recipe.title}</b></h1>
          <p className='text-left'><i>Makes {recipe.defaultServings} {recipe.servingUnits}</i></p>
          <p className='text-left'>{recipe.description}</p>
          <Table titles={['Ingredient', 'Amt', 'Units']} elements={recipe.ingredients} />
          <h1 className='text-2xl text-left'><b>Steps:</b></h1>
          <ul className='text-left steps-list'>
            {recipe.steps.map(step => <li>{step}</li>)}
          </ul>
        </>: null}
        <ul class="space-y-4">
          {recipes.map(recipe => {
            const permalink = `/recipes/${recipe.permalink}`
            return <NavLink to={permalink} className="text-gray-300 hover:text-white mx-2">
              <li class="bg-gray-800 p-4 rounded-lg shadow-lg"><span className='recipe-title'>{recipe.title}</span><br/>
              {recipe.description}</li>
            </NavLink>
            })}
        </ul>
      </main>
      <Footer/>
    </div>
  );
}

export default Recipes;