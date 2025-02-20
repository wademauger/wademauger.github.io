import Header from './header';
import Footer from './footer';
import { NavLink, useParams } from 'react-router';
import '../App.css';
import patterns from '../data/patterns';
import { Trapezoid, Panel } from '../knitting.ai';
import { PanelDiagram } from './PanelDiagram';

const PatternInstructions = ({ id, instructions = [] }) => (
  <div className="panel-instructions">
    <h3 className="panel-instruction-header">{id} Instructions:</h3>
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
  const patternInstructions = Object.keys(pattern ? pattern.shapes : {})
    .map(panelId => { 
        const panelData = pattern.shapes[panelId];
        const trapezoid = Trapezoid.fromJSON(panelData);
        const panel = new Panel(trapezoid);
        const instructions = panel.generateKnittingInstructions();
        return { id: panelId, instructions: instructions };
    });
  return (
    <div className="knitting-patterns-page">
      <Header />
      <main className="container mx-auto mt-8 px-4">
        {pattern ? (
          <>
            <h1 className="text-2xl text-left"><b>{pattern.title}</b></h1>
            <p className="text-left">{pattern.description}</p>
            <div className='diagrams'>
              {Object.keys(pattern.shapes).map((shape, index) => 
                <PanelDiagram key={index} shape={pattern.shapes[shape]} label={shape} />
              )}
            </div>
            {patternInstructions.map((instructions, index) => <PatternInstructions key={index} id={instructions.id} instructions={instructions.instructions} />)}
          </>
        ) : <p>Note that the pattern diagrams are not shown to scale. These patterns are only tested lightly, generally with a mens' medium. Please use discretion before casting on, and report issues on <a href="https://github.com/wademauger/wademauger.github.io/issues">github</a>. Thanks!</p>}

        <ul className="space-y-4">
          {patterns.map((pattern, index) => {
            const permalink = `/patterns/${pattern.permalink}`; // Correct permalink
            return (
              <NavLink key={index} to={permalink} className="text-gray-300 hover:text-white mx-2" key={pattern.permalink}> {/* Add key prop */}
                <li className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <span className="list-item-title">{pattern.title}</span><br />
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