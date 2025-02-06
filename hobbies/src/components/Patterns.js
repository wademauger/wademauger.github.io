import Header from './header';
import Footer from './footer';
import Table from './table'; // Or a custom component for knitting details
import { NavLink, useParams } from 'react-router';
import '../App.css';
import patterns from '../data/patterns'; // Import your knitting patterns JSON
import { TrapezoidDisplay } from '../AIknitting';

// Example custom component for displaying gauge (adapt as needed)
const PatternGauge = ({ gauge }) => (
  <div>
    <h3>Gauge:</h3>
    <p>{gauge}</p> {/* Format gauge as needed */}
  </div>
);

// Example custom component for materials
const PatternMaterials = ({ materials }) => (
  <div>
    <h3>Materials:</h3>
    <ul>
      {materials.map((material, index) => (
        <li key={index}>{material}</li>
      ))}
    </ul>
  </div>
);

const PatternInstructions = ({ instructions }) => (
  <div>
    <h3>Instructions:</h3>
    <ol>
      {instructions.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  </div>
);

function KnittingPatterns() {
  const { id } = useParams();
  const pattern = patterns.find(pattern => pattern.permalink === id);

  return (
    <div className="knitting-patterns-page">
      <Header />
      <main className="container mx-auto mt-8 px-4">
        {pattern ? (
          <>
            <h1 className="text-2xl text-left"><b>{pattern.title}</b></h1>
            <p className="text-left">{pattern.description}</p>
            {Object.keys(pattern.shapes).map(shape => 
              <TrapezoidDisplay trapezoid={pattern.shapes[shape]} label={shape} />
            )}
            {/* Use custom components or adapt your Table component */}
            {pattern.gauge && <PatternGauge gauge={pattern.gauge} />}
            {pattern.materials && <PatternMaterials materials={pattern.materials} />}
            {pattern.instructions && <PatternInstructions instructions={pattern.instructions} />}

            {/* Example adapting the table component if applicable */}
            {/* {pattern.details && <Table titles={['Needle Size', 'Yarn Weight']} elements={pattern.details} />} */}

          </>
        ) : null}

        <ul className="space-y-4">
          {patterns.map(pattern => {
            const permalink = `/patterns/${pattern.permalink}`; // Correct permalink
            return (
              <NavLink to={permalink} className="text-gray-300 hover:text-white mx-2" key={pattern.permalink}> {/* Add key prop */}
                <li className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <span className="pattern-title">{pattern.title}</span><br />
                  {pattern.description}
                </li>
              </NavLink>
            );
          })}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

export default KnittingPatterns;