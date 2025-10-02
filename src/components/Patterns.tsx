import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router';
import { garments, visualMotifs } from '../data/garments';
import { Trapezoid } from '../models/Trapezoid';
import { Panel } from '../models/Panel';
import { Gauge } from '../models/Gauge';
import { PanelDiagram } from './PanelDiagram';
import { Select, Collapse, Card, Button, Radio, Row, Col, InputNumber, Steps, Modal } from 'antd';
import '../App.css';

const { Panel: AntPanel } = Collapse;
const { Step } = Steps; // Destructure Step from Steps

const PatternInstructions = ({ patternId, panelId, instructions = [], isKnitting, setIsKnitting, handleCancel }) => {
  const [currentStep, setCurrentStep] = useState(0); // State of which knitting instruction the user is on
  const [isCompleted, setIsCompleted] = useState(false); // State to control the completion message
  const [activeKey, setActiveKey] = useState([]); // State to control the collapse panel, initially empty to keep it closed
  const currentStepRef = useRef(null); // Create a ref for the current step element

  const handleNextStep = useCallback(() => {
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

  useEffect(() => {
    // Scroll the current step element into view when the step changes
    if (currentStepRef.current) {
      currentStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const getKnittingControls = () => (isKnitting ? (
    <div className="row flex knitting-controls sticky-controls">
      <Radio.Group buttonStyle="solid">
        <Radio.Button onClick={handlePreviousStep}>Step Back</Radio.Button>
        <Radio.Button onClick={handleNextStep}> Next Step</Radio.Button>
        <Radio.Button onClick={() => handleCancelClick(false)}>Cancel</Radio.Button>
      </Radio.Group>
    </div>
  ) : null);

  const handleButtonClick = (event) => {
    event.stopPropagation(); // Prevent collapse from toggling
    setIsKnitting(`${patternId}-${panelId}`, setCurrentStep);
    setIsCompleted(false);
    setActiveKey(['1']); // Ensure the collapse is open
  };

  const handleCancelClick = (skipConfirm) => {
    handleCancel(skipConfirm);
    setActiveKey([]); // Close the collapse
  };

  return (
    <div className="panel-instructions">
      <Collapse size="large" activeKey={activeKey} onChange={setActiveKey}>
        <AntPanel 
          header={
            <div className="panel-header">
              {panelId}
              {!isKnitting && (
                <Button 
                  type="primary" 
                  className="start-knitting-button spaced-button" 
                  onClick={handleButtonClick}
                >
                  Start Knitting
                </Button>
              )}
            </div>
          } 
          key="1"
        >
          {getKnittingControls()}
          <Steps size="small" current={currentStep} direction="vertical">
            {instructions.map((step, index) => (
              <Step key={index} title={step} ref={index === currentStep ? currentStepRef : null} />
            ))}
          </Steps>
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
  const [selectedMotif, setSelectedMotif] = useState(null); // Add state for selected visual motif

  const pattern = garments.find((pattern: any) => pattern.permalink === patternId);
  const patternInstructions = Object.keys(pattern ? pattern.shapes : {})
    .map((panelId: any) => {
      const panelData = pattern.shapes[panelId];
      const trapezoid = Trapezoid.fromObject(panelData);
      const panel = new Panel(trapezoid, new Gauge(gauge.stitches, gauge.rows), sizeModifier, selectedMotif); // Pass gauge, sizeModifier, and selectedMotif to Panel
      const instructions = panel.generateKnittingInstructions();
      return { id: panelId, instructions: instructions };
    });

  useEffect(() => {
    // Reset knitting state when pattern changes
    setCurrentKnittingPanel(null);
  }, [patternId]);

  const setIsKnitting = (panelId, resetCurrentStep) => {
    if (currentKnittingPanel && currentKnittingPanel !== panelId) {
      Modal.confirm({
        title: 'Cancel current panel?',
        content: 'A panel is currently in progress. Do you want to cancel it?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setCurrentKnittingPanel(panelId);
          resetCurrentStep(0);
        }
      });
    } else {
      setCurrentKnittingPanel(panelId);
      resetCurrentStep(0); // Reset current step to 0
    }
  };

  const handleCancel = (skipConfirm) => {
    if (!skipConfirm) {
      // Use modal confirm synchronously by returning early unless user confirms via callback
      Modal.confirm({
        title: 'Are you sure?',
        content: 'Are you sure you want to cancel?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => { setCurrentKnittingPanel(null); }
      });
      return;
    }
    setCurrentKnittingPanel(null);
  };

  const handleSizeChange = (event) => {
    const newSizeModifier = parseFloat(event?.target?.value || event);
      if (currentKnittingPanel) {
      Modal.confirm({
        title: 'Change size?',
        content: 'Changing the size will discard your current progress. Do you want to continue?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setSizeModifier(newSizeModifier);
          setCurrentKnittingPanel(null);
        }
      });
    } else {
      setSizeModifier(newSizeModifier);
    }
  };

  const handleGaugeChange = (type, value) => {
    setGauge(prevGauge => ({ ...prevGauge, [type]: value }));
  };

  const handleMotifChange = (value) => {
    setSelectedMotif(value ? visualMotifs[value] : null);
  };

  return (
    <div className="knitting-patterns-page">
      <main className="container mx-auto">
        {pattern ? (
          <>
            <h1 className="text-2xl text-left"><b>{pattern.title}</b></h1>
            <p className="text-left description">{pattern.description}</p>
            <Row>
              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Card title="Size and Gauge Settings">
                  <p>
                    Choose a size:
                    <span className="card-input">
                      <Select
                        style={{ width: 240 }}
                        onChange={handleSizeChange}
                        defaultValue={1}
                        options={Object.entries(pattern?.sizes || {}).map(([label, value]) => ({ label, value }))}
                      />
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
                  <p>
                    Choose a visual motif:
                    <span className="card-input">
                      <Select
                        style={{ width: 240 }}
                        onChange={handleMotifChange}
                        options={[
                          { label: 'None', value: null },
                          ...Object.keys(visualMotifs).map((key: any) => ({ label: key, value: key }))
                        ]}
                      />
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
            {pattern.finishingSteps && pattern.finishingSteps.length > 0 && (
              <>
                <h1 className='text-2xl text-left'><b>Finishing Steps:</b></h1>
                <ul className='text-left steps-list'>
                  {pattern.finishingSteps.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
              </>
            )}
          </>
        ) : (
          <p>Note that the pattern diagrams are not shown to scale. These patterns are only tested lightly, generally with a mens' medium. Please use discretion before casting on, and report issues on <a href="https://github.com/wademauger/wademauger.github.io/issues">github</a>. Thanks!</p>
        )}
      </main>
    </div>
  );
}

export default KnittingPatterns;