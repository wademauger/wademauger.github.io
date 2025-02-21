import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router';
import Header from './header';
import Footer from './footer';
import patterns from '../data/patterns';
import { Trapezoid, Panel } from '../knitting.ai';
import { PanelDiagram } from './PanelDiagram';
import '../App.css';

const buttonClass = 'rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none';

const PatternInstructions = ({ id, instructions = [], isKnitting, setIsKnitting }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    setCurrentStep(prevStep => (prevStep + 1) % instructions.length);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prevStep => (prevStep - 1 + instructions.length) % instructions.length);
  };

  const handleCancel = () => {
    setIsKnitting(null);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isKnitting) return;

    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        handleNextStep();
      }
      if (event.key === 'ArrowLeft') {
        handlePreviousStep();
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isKnitting]);

  return (
    <div className="panel-instructions">
      <h3 className="panel-instruction-header">
        {id} Instructions:
        {!isKnitting ? (
          <button className={buttonClass}
            onClick={() => setIsKnitting(id)}>Start Knitting</button>
        ) : (
          <div className="row flex">
  <button onClick={handlePreviousStep} className="rounded-md rounded-r-none border border-r-0 border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
    Previous Step
  </button>
  <button onClick={handleNextStep} className="rounded-md rounded-r-none rounded-l-none border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
    Next Step
  </button>
  <button onClick={handleCancel} className="rounded-md rounded-l-none border border-l-0 border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
    Stop
  </button>
</div>
        )}
      </h3>
      <ol>
        {instructions.map((step, index) => (
          <li key={index} style={{ fontWeight: index === currentStep ? 'bold' : 'normal' }}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
};

function KnittingPatterns() {
  const { id } = useParams();
  const [currentKnittingPanel, setCurrentKnittingPanel] = useState(null);
  const [sizeModifier, setSizeModifier] = useState(1); // Add state for size modifier

  const pattern = patterns.find(pattern => pattern.permalink === id);
  const patternInstructions = Object.keys(pattern ? pattern.shapes : {})
    .map(panelId => {
      const panelData = pattern.shapes[panelId];
      const trapezoid = Trapezoid.fromJSON(panelData);
      const panel = new Panel(trapezoid, undefined, sizeModifier); // Pass sizeModifier to Panel
      const instructions = panel.generateKnittingInstructions();
      return { id: panelId, instructions: instructions };
    });

  const setIsKnitting = (panelId) => {
    if (currentKnittingPanel && currentKnittingPanel !== panelId) {
      if (window.confirm("A panel is currently in progress. Do you want to cancel it?")) {
        setCurrentKnittingPanel(panelId);
      }
    } else {
      setCurrentKnittingPanel(panelId);
    }
  };

  const handleSizeChange = (event) => {
    const newSizeModifier = parseFloat(event.target.value);
    if (currentKnittingPanel) {
      if (window.confirm("Changing the size will discard your current progress. Do you want to continue?")) {
        setSizeModifier(newSizeModifier);
        setCurrentKnittingPanel(null); // Reset current knitting panel
      }
    } else {
      setSizeModifier(newSizeModifier);
    }
  };

  return (
    <div className="knitting-patterns-page">
      <Header />
      <main className="container mx-auto mt-8 px-4">
        {pattern ? (
          <>
            <h1 className="text-2xl text-left"><b>{pattern.title}</b></h1>
            <p className="text-left">{pattern.description}</p>
            <div class="w-full max-w-sm min-w-[200px]">
              <div className="relative">
                <select
                  onChange={handleSizeChange}
                  defaultValue={1}
                  className="w-full text-sm border rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none shadow-sm focus:shadow-md appearance-none cursor-pointer">
                  {Object.entries(pattern.sizes).map(([label, value]) => (
                    <option key={label} value={value}>{label}</option>
                  ))}
                </select>
              </div>

            </div>
            <div className='diagrams'>
              {Object.keys(pattern.shapes).map((shape, index) =>
                <PanelDiagram key={index} shape={pattern.shapes[shape]} label={shape} sizeModifier={sizeModifier} />
              )}
            </div>
            {patternInstructions.map((instructions, index) => (
              <PatternInstructions
                key={index}
                id={instructions.id}
                instructions={instructions.instructions}
                isKnitting={currentKnittingPanel === instructions.id}
                setIsKnitting={setIsKnitting}
              />
            ))}
          </>
        ) : <p>Note that the pattern diagrams are not shown to scale. These patterns are only tested lightly, generally with a mens' medium. Please use discretion before casting on, and report issues on <a href="https://github.com/wademauger/wademauger.github.io/issues">github</a>. Thanks!</p>}

        <ul className="space-y-4">
          {patterns.map((pattern, index) => {
            const permalink = `/patterns/${pattern.permalink}`; // Correct permalink
            return (
              <NavLink key={index} to={permalink} className="text-gray-300 hover:text-white mx-2"> {/* Add key prop */}
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