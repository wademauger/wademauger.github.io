import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useParams } from 'react-router';
import patterns from '../data/patterns';
import { Trapezoid, Panel, Gauge } from '../knitting.ai';
import { PanelDiagram } from './PanelDiagram';
import { Select, Collapse, Card, Button, Radio, Row, Col, InputNumber } from "antd";
import '../App.css';

const buttonClass = 'rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:bg-slate-800 hover:border-slate-800 focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none';

const { Panel: AntPanel } = Collapse;

const PatternInstructions = ({ patternId, panelId, instructions = [], isKnitting, setIsKnitting, handleCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNextStep = useCallback(() => {
    console.log(currentStep, instructions.length);
    if (currentStep + 1 === instructions.length) {
      setIsCompleted(true);
      handleCancel(true); // Pass true to skip confirmation
    } else {
      setCurrentStep(prevStep => (prevStep + 1) % instructions.length);
    }
  }, [currentStep, instructions.length, handleCancel]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prevStep => (prevStep - 1 + instructions.length) % instructions.length);
  }, [instructions.length]);

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
  }, [isKnitting, handleNextStep, handlePreviousStep]);

  useEffect(() => {
    // Reset currentStep and isCompleted when the pattern or panel changes
    setCurrentStep(0);
    setIsCompleted(false);
  }, [patternId, panelId]);

  const getKnittingControls = () => (isKnitting ? (
    <div className="row flex">
      <Radio.Group buttonStyle="solid">
        <Radio.Button onClick={handlePreviousStep}>Previous Step</Radio.Button>
        <Radio.Button onClick={handleNextStep}> Next Step </Radio.Button>
        <Radio.Button onClick={() => handleCancel(false)}>Cancel</Radio.Button>
      </Radio.Group>
    </div>
  ) : (
    <Button type="primary" className={buttonClass} onClick={() => { setIsKnitting(`${patternId}-${panelId}`, setCurrentStep); setIsCompleted(false); }}>Start Knitting</Button>
  ));

  return (
    <div className="panel-instructions">
      <Collapse>
        <AntPanel header={panelId} key="1">
          {getKnittingControls()}
          <ol>
            {instructions.map((step, index) => (
              <li key={index} style={{ fontWeight: index === currentStep ? 'bold' : 'normal' }}>
                {step}
              </li>
            ))}
          </ol>
          {isCompleted && (
            <div className="completion-message">
              You have completed the panel!
            </div>
          )}
        </AntPanel>
      </Collapse>
    </div>
  );
};

function KnittingPatterns() {
  const { id: patternId } = useParams();
  const [currentKnittingPanel, setCurrentKnittingPanel] = useState(null);
  const [sizeModifier, setSizeModifier] = useState(1); // Add state for size modifier
  const [gauge, setGauge] = useState({ stitches: 19, rows: 30 }); // Add state for gauge

  const pattern = patterns.find(pattern => pattern.permalink === patternId);
  const patternInstructions = Object.keys(pattern ? pattern.shapes : {})
    .map(panelId => {
      const panelData = pattern.shapes[panelId];
      const trapezoid = Trapezoid.fromJSON(panelData);
      const panel = new Panel(trapezoid, new Gauge(gauge.stitches, gauge.rows), sizeModifier); // Pass gauge and sizeModifier to Panel
      const instructions = panel.generateKnittingInstructions();
      return { id: panelId, instructions: instructions };
    });

  useEffect(() => {
    // Reset knitting state when pattern changes
    setCurrentKnittingPanel(null);
  }, [patternId]);

  const setIsKnitting = (panelId, resetCurrentStep) => {
    if (currentKnittingPanel && currentKnittingPanel !== panelId) {
      if (window.confirm("A panel is currently in progress. Do you want to cancel it?")) {
        setCurrentKnittingPanel(panelId);
        resetCurrentStep(0); // Reset current step to 0
      }
    } else {
      setCurrentKnittingPanel(panelId);
      resetCurrentStep(0); // Reset current step to 0
    }
  };

  const handleCancel = (skipConfirm) => {
    if (!skipConfirm && !window.confirm("Are you sure you want to cancel?")) {
      return;
    }
    setCurrentKnittingPanel(null);
  };

  const handleSizeChange = (event) => {
    const newSizeModifier = parseFloat(event?.target?.value || event);
    if (currentKnittingPanel) {
      if (window.confirm("Changing the size will discard your current progress. Do you want to continue?")) {
        setSizeModifier(newSizeModifier);
        setCurrentKnittingPanel(null); // Reset current knitting panel
      }
    } else {
      setSizeModifier(newSizeModifier);
    }
  };

  const handleGaugeChange = (type, value) => {
    setGauge(prevGauge => ({ ...prevGauge, [type]: value }));
  };

  return (
    <div className="knitting-patterns-page">
      <main className="container mx-auto mt-8 px-4">
        {pattern ? (
          <>
            <h1 className="text-2xl text-left"><b>{pattern.title}</b></h1>
            <p className="text-left description">{pattern.description}</p>
            <Row>
              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Card
                  title="Size and Gauge Settings"
                >
                  <p>
                    Choose a size:
                    <span className="card-input">
                      <Select
                        style={{
                          width: 240,
                        }}
                        onChange={handleSizeChange}
                        defaultValue={1}
                        options={Object.entries(pattern?.sizes || {}).map(([label, value]) => ({ label, value }))} />
                    </span>
                  </p>
                  <p>
                    Gauge stitches per 4 inches
                    <span className="card-input">
                      <InputNumber min={1} defaultValue={19} onChange={(value) => handleGaugeChange('stitches', value)} />
                    </span>
                  </p>
                  <p>
                    Gauge rows per 4 inches
                    <span className="card-input">
                      <InputNumber min={1} defaultValue={30} onChange={(value) => handleGaugeChange('rows', value)} />
                    </span>
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={24} lg={14} xl={14}>
                <div className='diagrams'>
                  {Object.keys(pattern.shapes).map((shape, index) =>
                    <PanelDiagram key={index} shape={pattern.shapes[shape]} label={shape} sizeModifier={sizeModifier} />
                  )}
                </div>
              </Col>
            </Row>
            {patternInstructions.map((instructions, index) => (
              <PatternInstructions
                key={index}
                patternId={patternId}
                panelId={instructions.id}
                instructions={instructions.instructions}
                isKnitting={currentKnittingPanel === `${patternId}-${instructions.id}`}
                setIsKnitting={setIsKnitting}
                handleCancel={handleCancel}
              />
            ))}
          </>
        ) : <p>Note that the pattern diagrams are not shown to scale. These patterns are only tested lightly, generally with a mens' medium. Please use discretion before casting on, and report issues on <a href="https://github.com/wademauger/wademauger.github.io/issues">github</a>. Thanks!</p>}

      </main>
    </div>
  );
}

export default KnittingPatterns;